"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateInterviewQuestion, evaluateInterviewAnswer, generateOverallScore, generateFeedbackReport } from "@/lib/interview/groq-interview";
import { revalidatePath } from "next/cache";

export async function startInterview(type: string, difficulty: string, company: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!dbUser) throw new Error("User not found");

  const { data, error } = await supabaseAdmin
    .from("interviews")
    .insert({
      user_id: dbUser.id,
      interview_type: type,
      difficulty,
      company: company || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to start interview:", error);
    throw new Error("Failed to start interview");
  }

  return data.id;
}

export async function getNextQuestion(interviewId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch interview details
  const { data: interview, error: interviewError } = await supabaseAdmin
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .single();

  if (interviewError || !interview) throw new Error("Interview not found");

  // Fetch previous questions
  const { data: previousQuestionsData } = await supabaseAdmin
    .from("questions")
    .select("question_text")
    .eq("interview_id", interviewId);

  const previousQuestions = previousQuestionsData?.map(q => q.question_text) || [];

  // Generate new question using Groq
  const questionText = await generateInterviewQuestion(
    interview.interview_type,
    interview.difficulty,
    interview.company || "",
    previousQuestions
  );

  // Store new question
  const { data: newQuestion, error: qError } = await supabaseAdmin
    .from("questions")
    .insert({
      interview_id: interviewId,
      question_text: questionText,
    })
    .select("id")
    .single();

  if (qError || !newQuestion) {
    console.error("Failed to save question:", qError);
    throw new Error("Failed to save question");
  }

  return {
    id: newQuestion.id,
    text: questionText,
  };
}

export async function submitAnswer(questionId: string, answerText: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch question details
  const { data: questionData, error: qError } = await supabaseAdmin
    .from("questions")
    .select("*, interviews(interview_type)")
    .eq("id", questionId)
    .single();

  if (qError || !questionData) throw new Error("Question not found");

  // Generate AI feedback
  const evaluation = await evaluateInterviewAnswer(
    questionData.interviews.interview_type,
    questionData.question_text,
    answerText,
    questionData.interviews.company
  );

  // Update question with user answer and AI feedback
  const { error: updateError } = await supabaseAdmin
    .from("questions")
    .update({
      user_answer: answerText,
      ai_feedback: evaluation.feedback,
      // Ideally we would also store the rating somewhere, but for now we just put the feedback
    })
    .eq("id", questionId);

  if (updateError) throw new Error("Failed to save answer");

  revalidatePath(`/dashboard/interview/${questionData.interview_id}`);
  
  return {
    feedback: evaluation.feedback,
    rating: evaluation.rating,
  };
}

export async function completeInterview(interviewId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch interview details
  const { data: interview, error: iError } = await supabaseAdmin
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .single();

  if (iError || !interview) throw new Error("Interview not found");

  // Fetch all questions and answers
  const { data: questions, error: qError } = await supabaseAdmin
    .from("questions")
    .select("question_text, user_answer")
    .eq("interview_id", interviewId);

  if (qError) throw new Error("Failed to fetch questions");

  const qnaPairs = (questions ?? []).map((q) => ({
    question: q.question_text,
    answer: q.user_answer || "(No answer provided)",
  }));

  if (qnaPairs.length === 0) {
    console.warn("No questions found for interview, using placeholder");
    qnaPairs.push({ question: "General readiness", answer: "(Interview ended without questions)" });
  }

  // Generate overall score via Groq
  let evaluation: {
    communication: number;
    technical: number;
    grammar: number;
    confidence: number;
    logical_thinking: number;
    problem_solving: number;
    final_score: number;
    feedback: string;
  };

  try {
    evaluation = await generateOverallScore(
      interview.interview_type,
      interview.difficulty,
      qnaPairs
    );
    console.log("Groq evaluation succeeded:", evaluation);
  } catch (err) {
    console.error("Groq score generation failed, using fallback scores:", err);
    evaluation = {
      communication: 70,
      technical: 65,
      grammar: 75,
      confidence: 70,
      logical_thinking: 65,
      problem_solving: 65,
      final_score: 68,
      feedback: "AI evaluation encountered an issue. These scores are estimated. Please try re-completing the interview if you want accurate scores.",
    };
  }

  // Check if a score already exists for this interview to avoid duplicates
  const { data: existingScore } = await supabaseAdmin
    .from("scores")
    .select("id")
    .eq("interview_id", interviewId)
    .maybeSingle();

  if (!existingScore) {
    // Try full insert (with all columns incl. logical_thinking, problem_solving, feedback).
    // If the DB schema is old and missing columns, fall back to base columns.
    const { error: fullInsertError } = await supabaseAdmin.from("scores").insert({
      interview_id: interviewId,
      communication: Math.round(evaluation.communication),
      technical: Math.round(evaluation.technical),
      grammar: Math.round(evaluation.grammar),
      confidence: Math.round(evaluation.confidence),
      logical_thinking: Math.round(evaluation.logical_thinking),
      problem_solving: Math.round(evaluation.problem_solving),
      final_score: Math.round(evaluation.final_score),
      feedback: evaluation.feedback,
    });

    if (fullInsertError) {
      console.warn("Full scores insert failed, trying base insert:", fullInsertError.message);
      const { error: baseInsertError } = await supabaseAdmin.from("scores").insert({
        interview_id: interviewId,
        communication: Math.round(evaluation.communication),
        technical: Math.round(evaluation.technical),
        grammar: Math.round(evaluation.grammar),
        confidence: Math.round(evaluation.confidence),
        final_score: Math.round(evaluation.final_score),
      });
      if (baseInsertError) {
        console.error("Base scores insert also failed:", baseInsertError);
        // Non-fatal: don't throw, still redirect user to evaluation page
      }
    } else {
      console.log("Score saved successfully for interview:", interviewId);
    }
  } else {
    console.log("Score already exists for interview:", interviewId, "— skipping insert");
  }

  // Generate + store feedback report (non-fatal if table doesn't exist yet)
  try {
    const { data: existingReport } = await supabaseAdmin
      .from("feedback_reports")
      .select("id")
      .eq("interview_id", interviewId)
      .maybeSingle();

    if (!existingReport) {
      const report = await generateFeedbackReport(
        interview.interview_type,
        interview.difficulty,
        interview.company || null,
        qnaPairs,
        {
          communication: evaluation.communication,
          technical: evaluation.technical,
          grammar: evaluation.grammar,
          confidence: evaluation.confidence,
          logical_thinking: evaluation.logical_thinking ?? evaluation.technical,
          problem_solving: evaluation.problem_solving ?? evaluation.technical,
          final_score: evaluation.final_score,
        }
      );

      await supabaseAdmin.from("feedback_reports").insert({
        interview_id: interviewId,
        executive_summary: report.executive_summary,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        improvement_tips: report.improvement_tips,
        recommended_topics: report.recommended_topics,
        practice_questions: report.practice_questions,
        company_readiness: report.company_readiness,
      });
      console.log("Feedback report saved for interview:", interviewId);
    }
  } catch (err) {
    // Fully non-fatal — scores are saved, user will still be redirected
    console.error("Feedback report generation/save failed (non-fatal):", err);
  }

  // ── Record progress entry (non-fatal) ────────────────────
  try {
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (dbUser) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // Check if there is already a progress row for this user today
      const { data: existing } = await supabaseAdmin
        .from("progress")
        .select("id, practice_time, interview_score")
        .eq("user_id", dbUser.id)
        .eq("date", today)
        .maybeSingle();

      const interviewScore = Math.round(evaluation.final_score);
      const practiceMinutes = 15; // ~15 min per interview session

      if (existing) {
        // Update: keep the highest interview score for today, accumulate practice time
        await supabaseAdmin
          .from("progress")
          .update({
            practice_time: (existing.practice_time || 0) + practiceMinutes,
            interview_score: Math.max(existing.interview_score || 0, interviewScore),
          })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("progress").insert({
          user_id: dbUser.id,
          date: today,
          practice_time: practiceMinutes,
          interview_score: interviewScore,
        });
      }
      console.log("Progress recorded for:", today);
    }
  } catch (err) {
    console.error("Progress insert failed (non-fatal):", err);
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/progress`);
  revalidatePath(`/dashboard/evaluation`);
  revalidatePath(`/dashboard/feedback`);
  return interviewId;
}
