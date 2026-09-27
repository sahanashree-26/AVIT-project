// Deterministic, rule-based preventive guidance. Nothing here is generated
// by a model — it's plain if/else logic over the assessment's real inputs,
// so it can never "hallucinate" a claim. Kept general and non-prescriptive.

export function buildInsights(assessment) {
  const insights = {
    nutrition: [],
    activity: [],
    sleep: [],
    weight: [],
    monitoring: [],
    consultation: [],
  }

  if (assessment.glucose >= 140) {
    insights.nutrition.push('Consider reducing refined sugar and refined-carbohydrate intake.')
    insights.monitoring.push('Glucose was elevated in this assessment — consider monitoring it periodically.')
  } else {
    insights.nutrition.push('Maintain a balanced diet with steady meal timing to support stable glucose levels.')
  }

  if (assessment.bmi >= 25) {
    insights.weight.push('A BMI in this range is associated with higher diabetes risk — gradual, sustainable weight management can help.')
    insights.activity.push('Regular moderate activity (e.g. brisk walking) most days of the week is generally recommended.')
  } else {
    insights.weight.push('Your BMI is currently in a healthier range — maintaining it is a good preventive step.')
    insights.activity.push('Keep up regular physical activity to help maintain your current BMI.')
  }

  if (assessment.blood_pressure >= 90) {
    insights.monitoring.push('Blood pressure was on the higher side — periodic monitoring is worth considering.')
  }

  insights.sleep.push('Aim for consistent, adequate sleep (most adults benefit from 7–9 hours) — poor sleep is linked to metabolic risk.')

  if (assessment.diabetes_pedigree >= 0.5) {
    insights.consultation.push('Family history appears to be a meaningful factor here — a healthcare professional can advise on tailored screening frequency.')
  }

  insights.consultation.push('Share this result with a healthcare professional, especially if this is your first assessment or your risk category has changed.')

  return insights
}

export function buildDoctorQuestions(assessment) {
  const questions = [
    'Based on these results, should I repeat this test, and if so, when?',
    'Are there lifestyle changes you would recommend I prioritize first?',
  ]

  if (assessment.risk_category === 'Higher Risk') {
    questions.push('What additional tests (e.g. HbA1c, fasting glucose) would you recommend?')
    questions.push('How often should I monitor my glucose given this result?')
  }

  if (assessment.diabetes_pedigree >= 0.5) {
    questions.push('Given my family history, is more frequent screening advisable?')
  }

  if (assessment.bmi >= 25) {
    questions.push('What would be a realistic, healthy weight-management target for me?')
  }

  questions.push('Is there anything in my result that could be explained by something other than diabetes risk?')

  return questions
}
