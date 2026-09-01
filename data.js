// ============================================================================
// Climate Change Awareness Survey — Source Data
// All figures come from the "Climate Change Awareness Survey" Google Form.
// Demographic questions: 53 respondents. Awareness/opinion questions: 41.
// ============================================================================

const TOTAL_RESPONDENTS = 53;
const AWARENESS_RESPONDENTS = 41;
const SURVEY_FORM_URL = 'https://forms.gle/LpibqTECsCEzYqs1A';

const ageData = [
  { name: 'Below 18', value: 5, percent: 9.4 },
  { name: '18–25', value: 43, percent: 81.1 },
  { name: '26–35', value: 5, percent: 9.4 },
  { name: 'Above 45', value: 0, percent: 0 },
];

const genderData = [
  { name: 'Male', value: 29, percent: 54.7 },
  { name: 'Female', value: 24, percent: 45.3 },
];

const occupationData = [
  { name: 'Student', value: 30, percent: 56.6 },
  { name: 'Working Professional', value: 13, percent: 24.5 },
  { name: 'Business Owner', value: 3, percent: 5.7 },
  { name: 'Other', value: 7, percent: 13.2 },
];

const heardAboutData = [
  { name: 'Yes', value: 41, percent: 77.4 },
  { name: 'No', value: 12, percent: 22.6 },
];

const HEARD_ABOUT_PERCENT = 77.4;

const knowledgeData = [
  { rating: '1', value: 3, percent: 7.3 },
  { rating: '2', value: 2, percent: 4.9 },
  { rating: '3', value: 20, percent: 48.8 },
  { rating: '4', value: 10, percent: 24.4 },
  { rating: '5', value: 6, percent: 14.6 },
];

const AVERAGE_KNOWLEDGE_RATING = 3.34;

const sourceData = [
  { name: 'Social Media', value: 30, percent: 73.2 },
  { name: 'TV/News', value: 18, percent: 43.9 },
  { name: 'School/College', value: 13, percent: 31.7 },
  { name: 'Newspapers', value: 12, percent: 29.3 },
  { name: 'Friends/Family', value: 8, percent: 19.5 },
  { name: 'Government Websites', value: 6, percent: 14.6 },
  { name: 'Other', value: 5, percent: 12.2 },
];

const seriousnessData = [
  { name: 'Strongly Agree', value: 15, percent: 36.6 },
  { name: 'Agree', value: 20, percent: 48.8 },
  { name: 'Neutral', value: 5, percent: 12.2 },
  { name: 'Disagree', value: 1, percent: 2.4 },
  { name: 'Strongly Disagree', value: 0, percent: 0 },
];

const SERIOUS_AGREE_PERCENT = 85.4;

const concernData = [
  { name: 'Global Warming', value: 22, percent: 53.7 },
  { name: 'Air Pollution', value: 10, percent: 24.4 },
  { name: 'Deforestation', value: 3, percent: 7.3 },
  { name: 'Water Scarcity', value: 4, percent: 9.8 },
  { name: 'Floods', value: 2, percent: 4.9 },
  { name: 'Heatwaves', value: 0, percent: 0 },
];

const keyInsights = [
  'Most respondents (81.1%) are between 18 and 25 years old.',
  '77.4% of respondents have heard about climate change before.',
  '85.4% agree that climate change is a serious global issue.',
  'Social media is the most common source of climate information, cited by 73.2% of respondents.',
  'Global warming is the biggest concern, selected by 53.7% of respondents.',
];

const CHART_COLORS = [
  '#1B5E3F', '#1F9E8B', '#4FD1A5', '#0A1A2F', '#E8734A', '#7FB3D5', '#8FA398',
];
