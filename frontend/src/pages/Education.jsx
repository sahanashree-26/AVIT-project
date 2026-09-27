const TOPICS = [
  {
    title: 'What is diabetes?',
    body: 'Diabetes is a chronic condition in which the body either does not produce enough insulin or cannot use it effectively, leading to elevated blood glucose levels over time.',
  },
  {
    title: 'Diabetes risk factors',
    body: 'Common risk factors include higher BMI, physical inactivity, family history, age, and elevated blood pressure or glucose levels. Having risk factors does not guarantee developing diabetes.',
  },
  {
    title: 'Blood glucose',
    body: 'Blood glucose is the amount of sugar circulating in your blood. It is regulated by insulin, and consistently high levels over time are a key indicator used in diabetes screening.',
  },
  {
    title: 'HbA1c',
    body: 'HbA1c reflects average blood glucose levels over roughly the past 2–3 months, and is commonly used alongside single-point glucose tests for a fuller picture.',
  },
  {
    title: 'BMI',
    body: 'Body Mass Index (BMI) is a simple ratio of weight to height, used as a general screening indicator — it does not directly measure body fat or overall health.',
  },
  {
    title: 'Physical activity',
    body: 'Regular moderate activity helps the body use insulin more effectively and supports healthy weight management, both linked to lower diabetes risk.',
  },
  {
    title: 'Nutrition',
    body: 'A balanced diet with steady meal timing and reduced refined sugar/carbohydrate intake can help support stable blood glucose levels.',
  },
  {
    title: 'Sleep',
    body: 'Poor or inconsistent sleep is associated with metabolic changes that may increase diabetes risk over time — most adults benefit from 7–9 hours nightly.',
  },
  {
    title: 'Preventive care',
    body: 'Regular check-ups, periodic screening, and open conversations with a healthcare professional are some of the most effective ways to catch and manage risk early.',
  },
]

export default function Education() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-900">Diabetes Education Hub</h1>
      <p className="mt-1 text-sm text-ink-700">
        Short, general explanations to help you understand your assessment and reports.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div key={t.title} className="card">
            <h2 className="font-semibold text-ink-900">{t.title}</h2>
            <p className="mt-2 text-sm text-ink-700">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        This content is general education, not medical advice. Always consult a healthcare
        professional for guidance specific to you.
      </div>
    </div>
  )
}
