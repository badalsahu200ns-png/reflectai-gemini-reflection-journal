import {
  CountryData,
  OccupationTaxonomyCategory,
  OccupationItem
} from '../types';

// ==========================================
// 1. SUPPORTED COUNTRIES & EDUCATION SYSTEMS
// ==========================================
export const GLOBAL_COUNTRIES: CountryData[] = [
  // --- ASIA ---
  {
    countryCode: 'IN',
    countryName: 'India',
    region: 'Asia',
    flagEmoji: '🇮🇳',
    educationFrameworkName: 'National Education Policy (NEP) / CBSE / ICSE / State Boards',
    educationStages: [
      { id: 'in_before_10', label: 'Before Class 10 (Secondary)', stageLevel: 1, isSecondaryGate: false },
      { id: 'in_class_10', label: 'Class 10 (Secondary School Certificate / Matriculation)', stageLevel: 2, isSecondaryGate: true },
      { id: 'in_class_11', label: 'Class 11 (Higher Secondary Stream: Science / Commerce / Arts)', stageLevel: 3, isSecondaryGate: false },
      { id: 'in_class_12', label: 'Class 12 (Higher Secondary Certificate / 10+2)', stageLevel: 4, isSecondaryGate: false },
      { id: 'in_diploma', label: 'Polytechnic Diploma (3-year vocational / technical)', stageLevel: 5, isSecondaryGate: false },
      { id: 'in_iti', label: 'ITI Certificate (Industrial Training Institute)', stageLevel: 5, isSecondaryGate: false },
      { id: 'in_bachelor', label: "Bachelor's Degree (B.Tech / B.Sc / B.Com / BA / BBA / MBBS)", stageLevel: 6, isSecondaryGate: false },
      { id: 'in_master', label: "Master's Degree (M.Tech / M.Sc / M.Com / MA / MBA / MD)", stageLevel: 7, isSecondaryGate: false },
      { id: 'in_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false },
      { id: 'in_professional', label: 'Chartered / Professional Qualification (CA, CS, CMA, Bar)', stageLevel: 7, isSecondaryGate: false },
      { id: 'in_professional_worker', label: 'Working Professional / Upskilling', stageLevel: 6, isSecondaryGate: false },
      { id: 'in_career_changer', label: 'Career Changer (Self-taught / Bootcamps / Lateral transition)', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'Class 10 Board Exams (CBSE/ICSE/State SSC)',
    grade12EquivName: 'Class 12 Board Exams (HSC / 10+2)',
    vocationalSystemName: 'Polytechnic / ITI / NSDC Skills Hubs',
    primaryLanguage: 'English & Hindi (plus Regional Languages)'
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    region: 'Asia',
    flagEmoji: '🇨🇳',
    educationFrameworkName: 'National Compulsory & Higher Education System (Gaokao)',
    educationStages: [
      { id: 'cn_junior_middle', label: 'Junior Middle School (Grade 9 / Chuzhong)', stageLevel: 2, isSecondaryGate: true },
      { id: 'cn_senior_academic', label: 'Senior Middle School (General High School / Gaozhong)', stageLevel: 4, isSecondaryGate: false },
      { id: 'cn_secondary_vocational', label: 'Secondary Vocational School (Zhongzhuan / Zhongzhi)', stageLevel: 4, isSecondaryGate: false },
      { id: 'cn_dazhuan', label: 'Junior College Diploma (Dazhuan / Higher Vocational)', stageLevel: 5, isSecondaryGate: false },
      { id: 'cn_bachelor', label: "Bachelor's Degree (Benke / Regular University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'cn_master', label: "Master's Degree (Shuoshi)", stageLevel: 7, isSecondaryGate: false },
      { id: 'cn_doctorate', label: 'Doctorate (Boshi)', stageLevel: 8, isSecondaryGate: false },
      { id: 'cn_working', label: 'Working Professional / Lateral Transition', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'Junior Middle School Graduation / Zhongkao',
    grade12EquivName: 'Senior Middle School / Gaokao Examination',
    vocationalSystemName: 'Secondary & Higher Vocational Colleges (Zhiye Xueyuan)',
    primaryLanguage: 'Mandarin Chinese'
  },
  {
    countryCode: 'JP',
    countryName: 'Japan',
    region: 'Asia',
    flagEmoji: '🇯🇵',
    educationFrameworkName: 'MEXT 6-3-3-4 Education Structure',
    educationStages: [
      { id: 'jp_junior_high', label: 'Junior High School (Chugakko - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'jp_high_school', label: 'High School (Kotogakko - General / Academic)', stageLevel: 4, isSecondaryGate: false },
      { id: 'jp_vocational_high', label: 'Vocational High School (Senmon Kotogakko)', stageLevel: 4, isSecondaryGate: false },
      { id: 'jp_kosen', label: 'College of Technology (Kosen - 5-year integrated)', stageLevel: 5, isSecondaryGate: false },
      { id: 'jp_senmon_gakko', label: 'Professional Training College (Senmon Gakko Diploma)', stageLevel: 5, isSecondaryGate: false },
      { id: 'jp_junior_college', label: 'Junior College (Tanki Daigaku)', stageLevel: 5, isSecondaryGate: false },
      { id: 'jp_bachelor', label: "Bachelor's Degree (Daigaku Gakushi)", stageLevel: 6, isSecondaryGate: false },
      { id: 'jp_master', label: "Master's Degree (Shushi)", stageLevel: 7, isSecondaryGate: false },
      { id: 'jp_doctorate', label: 'Doctorate (Hakushi)', stageLevel: 8, isSecondaryGate: false },
      { id: 'jp_working', label: 'Mid-Career Shushoku / Professional', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'Junior High School Completion (Grade 9)',
    grade12EquivName: 'High School Graduation (Kotogakko)',
    vocationalSystemName: 'Senmon Gakko & Kosen Tech Colleges',
    primaryLanguage: 'Japanese'
  },
  {
    countryCode: 'KR',
    countryName: 'South Korea',
    region: 'Asia',
    flagEmoji: '🇰🇷',
    educationFrameworkName: 'MOE 6-3-3-4 System (CSAT / Suneung)',
    educationStages: [
      { id: 'kr_middle', label: 'Middle School (Jung-hakgyo - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'kr_general_high', label: 'General High School (Ilban Godeung-hakgyo)', stageLevel: 4, isSecondaryGate: false },
      { id: 'kr_meister_high', label: 'Meister / Specialized Vocational High School', stageLevel: 4, isSecondaryGate: false },
      { id: 'kr_junior_college', label: 'Junior Vocational College (Jeonmun Daehak)', stageLevel: 5, isSecondaryGate: false },
      { id: 'kr_bachelor', label: "Bachelor's Degree (Haksa / 4-Year University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'kr_master', label: "Master's Degree (Seoksa)", stageLevel: 7, isSecondaryGate: false },
      { id: 'kr_doctorate', label: 'Doctorate (Baksa)', stageLevel: 8, isSecondaryGate: false },
      { id: 'kr_working', label: 'Working Professional / Industry Lateral', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'Middle School Completion',
    grade12EquivName: 'High School Diploma (Suneung CSAT)',
    vocationalSystemName: 'Meister High Schools & Jeonmun Daehak Colleges',
    primaryLanguage: 'Korean'
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    region: 'Asia',
    flagEmoji: '🇸🇬',
    educationFrameworkName: 'Ministry of Education (MOE) / SkillsFuture Framework',
    educationStages: [
      { id: 'sg_o_levels', label: 'Secondary 4/5 (GCE O-Levels / N-Levels)', stageLevel: 2, isSecondaryGate: true },
      { id: 'sg_ite', label: 'Institute of Technical Education (Nitec / Higher Nitec)', stageLevel: 4, isSecondaryGate: false },
      { id: 'sg_junior_college', label: 'Junior College (GCE A-Levels / IB Diploma)', stageLevel: 4, isSecondaryGate: false },
      { id: 'sg_polytechnic', label: 'Polytechnic Diploma (3-year Applied Science / Tech / Business)', stageLevel: 5, isSecondaryGate: false },
      { id: 'sg_bachelor', label: "Bachelor's Degree (NUS, NTU, SMU, SUTD, SIT, SUSS)", stageLevel: 6, isSecondaryGate: false },
      { id: 'sg_master', label: "Master's Degree / Postgraduate Diploma", stageLevel: 7, isSecondaryGate: false },
      { id: 'sg_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false },
      { id: 'sg_skillsfuture', label: 'SkillsFuture Work-Study / Professional Switcher', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'GCE O-Levels / N-Levels',
    grade12EquivName: 'GCE A-Levels / Polytechnic Diploma',
    vocationalSystemName: 'ITE & 5 National Polytechnics',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'MY',
    countryName: 'Malaysia',
    region: 'Asia',
    flagEmoji: '🇲🇾',
    educationFrameworkName: 'Malaysian Qualifications Framework (MQF)',
    educationStages: [
      { id: 'my_spm', label: 'Form 5 (SPM - Sijil Pelajaran Malaysia)', stageLevel: 2, isSecondaryGate: true },
      { id: 'my_stpm', label: 'Form 6 (STPM) / Matriculation / Foundation', stageLevel: 4, isSecondaryGate: false },
      { id: 'my_tvet_diploma', label: 'TVET Diploma / Polytechnic Certificate', stageLevel: 5, isSecondaryGate: false },
      { id: 'my_bachelor', label: "Bachelor's Degree (Ijazah Sarjana Muda)", stageLevel: 6, isSecondaryGate: false },
      { id: 'my_master', label: "Master's Degree (Sarjana)", stageLevel: 7, isSecondaryGate: false },
      { id: 'my_doctorate', label: 'Doctorate (Doktor Falsafah / PhD)', stageLevel: 8, isSecondaryGate: false },
      { id: 'my_working', label: 'Working Professional / Industry Upskilling', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'SPM (Form 5)',
    grade12EquivName: 'STPM / Foundation / Matrikulasi',
    vocationalSystemName: 'Politeknik & Kolej Komuniti (TVET)',
    primaryLanguage: 'Malay & English'
  },
  {
    countryCode: 'ID',
    countryName: 'Indonesia',
    region: 'Asia',
    flagEmoji: '🇮🇩',
    educationFrameworkName: 'Kerangka Kualifikasi Nasional Indonesia (KKNI)',
    educationStages: [
      { id: 'id_smp', label: 'Junior High School (SMP - Kelas 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'id_sma', label: 'Senior High School (SMA - Academic)', stageLevel: 4, isSecondaryGate: false },
      { id: 'id_smk', label: 'Vocational High School (SMK - Kejuruan)', stageLevel: 4, isSecondaryGate: false },
      { id: 'id_diploma', label: 'Diploma Program (D1 / D2 / D3 / D4 Terapan)', stageLevel: 5, isSecondaryGate: false },
      { id: 'id_sarjana', label: "Bachelor's Degree (Sarjana - S1)", stageLevel: 6, isSecondaryGate: false },
      { id: 'id_magister', label: "Master's Degree (Magister - S2)", stageLevel: 7, isSecondaryGate: false },
      { id: 'id_doktor', label: 'Doctorate (Doktor - S3)', stageLevel: 8, isSecondaryGate: false },
      { id: 'id_working', label: 'Working Professional / Prakerja', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: 'SMP Graduation (Kelas 9)',
    grade12EquivName: 'SMA / SMK Graduation (Ijazah)',
    vocationalSystemName: 'SMK & Politeknik Vokasi',
    primaryLanguage: 'Indonesian'
  },
  {
    countryCode: 'TH',
    countryName: 'Thailand',
    region: 'Asia',
    flagEmoji: '🇹🇭',
    educationFrameworkName: 'National Qualifications Framework (NQF Thailand)',
    educationStages: [
      { id: 'th_matthayom_3', label: 'Lower Secondary (Matthayom 3 - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'th_matthayom_6', label: 'Upper Secondary (Matthayom 6 - Academic)', stageLevel: 4, isSecondaryGate: false },
      { id: 'th_vocational_cert', label: 'Vocational Certificate (Por Chor)', stageLevel: 4, isSecondaryGate: false },
      { id: 'th_high_vocational_diploma', label: 'High Vocational Diploma (Por Sor)', stageLevel: 5, isSecondaryGate: false },
      { id: 'th_bachelor', label: "Bachelor's Degree (Parinya Tri)", stageLevel: 6, isSecondaryGate: false },
      { id: 'th_master', label: "Master's Degree (Parinya Tho)", stageLevel: 7, isSecondaryGate: false },
      { id: 'th_doctorate', label: 'Doctorate (Parinya Ek)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Matthayom 3',
    grade12EquivName: 'Matthayom 6 / Por Chor',
    vocationalSystemName: 'Vocational Education Commission Colleges',
    primaryLanguage: 'Thai'
  },
  {
    countryCode: 'VN',
    countryName: 'Vietnam',
    region: 'Asia',
    flagEmoji: '🇻🇳',
    educationFrameworkName: 'Vietnamese Qualifications Framework (VQF)',
    educationStages: [
      { id: 'vn_lower_sec', label: 'Lower Secondary School (THCS - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'vn_upper_sec', label: 'Upper Secondary School (THPT - Grade 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'vn_vocational_college', label: 'Vocational College Diploma (Cao Dang Nghe)', stageLevel: 5, isSecondaryGate: false },
      { id: 'vn_bachelor', label: "Bachelor's Degree (Dai Hoc)", stageLevel: 6, isSecondaryGate: false },
      { id: 'vn_master', label: "Master's Degree (Thac Si)", stageLevel: 7, isSecondaryGate: false },
      { id: 'vn_doctorate', label: 'Doctorate (Tien Si)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'THCS Completion (Bang Tot Nghiep THCS)',
    grade12EquivName: 'THPT National High School Exam (Tot Nghiep THPT)',
    vocationalSystemName: 'Vocational High Schools & Cao Dang Colleges',
    primaryLanguage: 'Vietnamese'
  },
  {
    countryCode: 'PH',
    countryName: 'Philippines',
    region: 'Asia',
    flagEmoji: '🇵🇭',
    educationFrameworkName: 'Philippine Qualifications Framework (PQF / K to 12)',
    educationStages: [
      { id: 'ph_junior_high', label: 'Junior High School (Grade 10 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ph_senior_high', label: 'Senior High School (Grade 11-12: STEM, ABM, HUMSS, TVL)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ph_tesda', label: 'TESDA National Certificate (NC I/II/III Vocational)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ph_bachelor', label: "Bachelor's Degree (CHED Accredited College/University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ph_master', label: "Master's Degree / Post-Baccalaureate", stageLevel: 7, isSecondaryGate: false },
      { id: 'ph_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Junior High School (Grade 10)',
    grade12EquivName: 'Senior High School Diploma (Grade 12)',
    vocationalSystemName: 'TESDA Technical-Vocational Institutes',
    primaryLanguage: 'Filipino & English'
  },
  {
    countryCode: 'BD',
    countryName: 'Bangladesh',
    region: 'Asia',
    flagEmoji: '🇧🇩',
    educationFrameworkName: 'Bangladesh National Qualifications Framework (BNQF)',
    educationStages: [
      { id: 'bd_ssc', label: 'Secondary School Certificate (SSC / Class 10)', stageLevel: 2, isSecondaryGate: true },
      { id: 'bd_hsc', label: 'Higher Secondary Certificate (HSC / Class 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'bd_polytechnic', label: 'Diploma in Engineering (4-year BTEB Polytechnic)', stageLevel: 5, isSecondaryGate: false },
      { id: 'bd_bachelor', label: "Bachelor's Degree (Honours / B.Sc / BBA / BA / MBBS)", stageLevel: 6, isSecondaryGate: false },
      { id: 'bd_master', label: "Master's Degree (M.Sc / MBA / MA)", stageLevel: 7, isSecondaryGate: false },
      { id: 'bd_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'SSC Board Examination',
    grade12EquivName: 'HSC Board Examination',
    vocationalSystemName: 'BTEB Polytechnic Institutes',
    primaryLanguage: 'Bengali'
  },
  {
    countryCode: 'PK',
    countryName: 'Pakistan',
    region: 'Asia',
    flagEmoji: '🇵🇰',
    educationFrameworkName: 'National Qualifications Framework of Pakistan (PQF)',
    educationStages: [
      { id: 'pk_matric', label: 'Matriculation (SSC / Grade 10: Science / Arts)', stageLevel: 2, isSecondaryGate: true },
      { id: 'pk_inter', label: 'Intermediate (HSSC / F.Sc / FA / ICS / I.Com - Grade 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'pk_dae', label: 'Diploma of Associate Engineering (DAE - 3 Years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'pk_bachelor', label: "Bachelor's Degree (BS 4-Years / MBBS / LLB / B.E)", stageLevel: 6, isSecondaryGate: false },
      { id: 'pk_master', label: "Master's / MS / MPhil Degree", stageLevel: 7, isSecondaryGate: false },
      { id: 'pk_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Matriculation (SSC)',
    grade12EquivName: 'Intermediate (HSSC / F.Sc)',
    vocationalSystemName: 'NAVTTC & Technical Education Boards (DAE)',
    primaryLanguage: 'Urdu & English'
  },
  {
    countryCode: 'LK',
    countryName: 'Sri Lanka',
    region: 'Asia',
    flagEmoji: '🇱🇰',
    educationFrameworkName: 'Sri Lanka Qualifications Framework (SLQF)',
    educationStages: [
      { id: 'lk_ol', label: 'G.C.E. Ordinary Level (O/L - Grade 11)', stageLevel: 2, isSecondaryGate: true },
      { id: 'lk_al', label: 'G.C.E. Advanced Level (A/L - Physical Science, Bio, Commerce, Arts, Tech)', stageLevel: 4, isSecondaryGate: false },
      { id: 'lk_nvq', label: 'NVQ Level 4-6 Diploma / Technical College', stageLevel: 5, isSecondaryGate: false },
      { id: 'lk_bachelor', label: "Bachelor's Degree (State or Private University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'lk_master', label: "Master's Degree / Postgraduate Diploma", stageLevel: 7, isSecondaryGate: false },
      { id: 'lk_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'G.C.E. O/L Examination',
    grade12EquivName: 'G.C.E. A/L Examination',
    vocationalSystemName: 'NVQ Framework & VTA Technical Colleges',
    primaryLanguage: 'Sinhala, Tamil & English'
  },
  {
    countryCode: 'NP',
    countryName: 'Nepal',
    region: 'Asia',
    flagEmoji: '🇳🇵',
    educationFrameworkName: 'National Vocational Qualifications System (NVQS Nepal)',
    educationStages: [
      { id: 'np_see', label: 'Secondary Education Examination (SEE / Grade 10)', stageLevel: 2, isSecondaryGate: true },
      { id: 'np_plus2', label: 'National Examination Board (+2 / Grade 11-12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'np_ctevt', label: 'CTEVT Diploma (3-year Engineering, Health, Agriculture)', stageLevel: 5, isSecondaryGate: false },
      { id: 'np_bachelor', label: "Bachelor's Degree (TU, KU, PU, PoU)", stageLevel: 6, isSecondaryGate: false },
      { id: 'np_master', label: "Master's Degree", stageLevel: 7, isSecondaryGate: false },
      { id: 'np_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'SEE (Secondary Education Examination)',
    grade12EquivName: '+2 NEB Board Examination',
    vocationalSystemName: 'CTEVT (Council for Technical Education)',
    primaryLanguage: 'Nepali & English'
  },
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    region: 'Asia',
    flagEmoji: '🇦🇪',
    educationFrameworkName: 'National Qualifications Framework (QFEmirates)',
    educationStages: [
      { id: 'ae_grade_10', label: 'Grade 10 / Year 11 (General / Advanced / IB / IGCSE)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ae_thanawiya', label: 'High School Diploma (Thanawiya Amma / Grade 12 / A-Levels)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ae_applied_diploma', label: 'Applied Technology / Higher Diploma (HCT / ADVETI)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ae_bachelor', label: "Bachelor's Degree (CAA Accredited University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ae_master', label: "Master's Degree", stageLevel: 7, isSecondaryGate: false },
      { id: 'ae_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grade 10 / Year 11',
    grade12EquivName: 'Thanawiya Amma / Grade 12 Diploma',
    vocationalSystemName: 'Applied Technology High Schools & HCT',
    primaryLanguage: 'Arabic & English'
  },
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    region: 'Asia',
    flagEmoji: '🇸🇦',
    educationFrameworkName: 'Saudi National Qualifications Framework (NQF-KSA / Vision 2030)',
    educationStages: [
      { id: 'sa_intermediate', label: 'Intermediate Certificate (Grade 9 / Kafa’ah)', stageLevel: 2, isSecondaryGate: true },
      { id: 'sa_secondary', label: 'General Secondary Certificate (Thanawiyah / Tahsili / Qiyas)', stageLevel: 4, isSecondaryGate: false },
      { id: 'sa_tvtc_diploma', label: 'TVTC Technical Diploma (Technical & Vocational Training Corp)', stageLevel: 5, isSecondaryGate: false },
      { id: 'sa_bachelor', label: "Bachelor's Degree (Bakalorius)", stageLevel: 6, isSecondaryGate: false },
      { id: 'sa_master', label: "Master's Degree (Majestir)", stageLevel: 7, isSecondaryGate: false },
      { id: 'sa_doctorate', label: 'Doctorate (Doktorah)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Intermediate Certificate',
    grade12EquivName: 'Thanawiyah (General Secondary Certificate)',
    vocationalSystemName: 'TVTC Technical Colleges',
    primaryLanguage: 'Arabic & English'
  },
  {
    countryCode: 'QA',
    countryName: 'Qatar',
    region: 'Asia',
    flagEmoji: '🇶🇦',
    educationFrameworkName: 'Qatar National Qualifications Framework (QNQF)',
    educationStages: [
      { id: 'qa_prep', label: 'Preparatory Certificate (Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'qa_secondary', label: 'General Secondary Certificate (Thanawiya / Grade 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'qa_applied_college', label: 'College of North Atlantic / UDST Applied Diploma', stageLevel: 5, isSecondaryGate: false },
      { id: 'qa_bachelor', label: "Bachelor's Degree (Qatar University / Education City)", stageLevel: 6, isSecondaryGate: false },
      { id: 'qa_master', label: "Master's Degree", stageLevel: 7, isSecondaryGate: false },
      { id: 'qa_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Preparatory School Certificate',
    grade12EquivName: 'Secondary School Certificate (Thanawiya)',
    vocationalSystemName: 'University of Doha for Science & Technology (UDST)',
    primaryLanguage: 'Arabic & English'
  },
  {
    countryCode: 'IL',
    countryName: 'Israel',
    region: 'Asia',
    flagEmoji: '🇮🇱',
    educationFrameworkName: 'Ministry of Education & Council for Higher Education (CHE)',
    educationStages: [
      { id: 'il_grade_10', label: 'Teth (Grade 9/10 Secondary)', stageLevel: 2, isSecondaryGate: true },
      { id: 'il_bagrut', label: 'Bagrut Matriculation Certificate (Grade 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'il_handassai', label: 'Practical Engineer / Technician Diploma (Handassai)', stageLevel: 5, isSecondaryGate: false },
      { id: 'il_military_tech', label: 'IDF Technological Unit Training (8200 / Mamram / Cyber)', stageLevel: 5, isSecondaryGate: false },
      { id: 'il_bachelor', label: "Bachelor's Degree (B.Sc / B.A / Technion / Universities)", stageLevel: 6, isSecondaryGate: false },
      { id: 'il_master', label: "Master's Degree (M.Sc / M.A)", stageLevel: 7, isSecondaryGate: false },
      { id: 'il_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grade 10 Secondary Completion',
    grade12EquivName: 'Bagrut Matriculation Certificate',
    vocationalSystemName: 'Mahat / Practical Engineering Colleges',
    primaryLanguage: 'Hebrew & English'
  },

  // --- NORTH AMERICA ---
  {
    countryCode: 'US',
    countryName: 'United States',
    region: 'North America',
    flagEmoji: '🇺🇸',
    educationFrameworkName: 'US Department of Education / Regional Accreditation / O*NET',
    educationStages: [
      { id: 'us_before_hs', label: 'Middle School / 9th Grade Freshman', stageLevel: 1, isSecondaryGate: false },
      { id: 'us_grade_10', label: '10th Grade (Sophomore)', stageLevel: 2, isSecondaryGate: true },
      { id: 'us_hs_diploma', label: 'High School Diploma / GED', stageLevel: 4, isSecondaryGate: false },
      { id: 'us_trade_cert', label: 'Trade / Vocational Certificate / Apprenticeship', stageLevel: 5, isSecondaryGate: false },
      { id: 'us_associate', label: "Associate Degree (AA / AS / AAS - Community College 2-Year)", stageLevel: 5, isSecondaryGate: false },
      { id: 'us_bachelor', label: "Bachelor's Degree (BA / BS - 4-Year College/University)", stageLevel: 6, isSecondaryGate: false },
      { id: 'us_master', label: "Master's Degree (MA / MS / MBA / MEd)", stageLevel: 7, isSecondaryGate: false },
      { id: 'us_professional_doc', label: 'Professional Doctorate (MD, JD, PharmD, DDS)', stageLevel: 8, isSecondaryGate: false },
      { id: 'us_phd', label: 'Academic PhD / Research Doctorate', stageLevel: 8, isSecondaryGate: false },
      { id: 'us_bootcamp', label: 'Industry Bootcamp / Certifications (AWS, CompTIA, PMP)', stageLevel: 5, isSecondaryGate: false },
      { id: 'us_career_changer', label: 'Career Changer / Skills-First Lateral', stageLevel: 6, isSecondaryGate: false }
    ],
    grade10EquivName: '10th Grade Sophomore Year',
    grade12EquivName: 'High School Diploma (12th Grade) / GED',
    vocationalSystemName: 'Community Colleges & Registered Apprenticeships (DOL)',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'CA',
    countryName: 'Canada',
    region: 'North America',
    flagEmoji: '🇨🇦',
    educationFrameworkName: 'Provincial Frameworks & Canadian Degree Qualifications (CMEC)',
    educationStages: [
      { id: 'ca_grade_10', label: 'Grade 10 Secondary School', stageLevel: 2, isSecondaryGate: true },
      { id: 'ca_hs_diploma', label: 'Secondary School Diploma (OSSD, DES, Dogwood, etc.)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ca_cegep', label: 'CEGEP Diploma (Quebec DEC - Pre-university or Technical)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ca_college_diploma', label: 'College Diploma / Advanced Diploma (2-3 year Applied Arts & Tech)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ca_red_seal', label: 'Red Seal Trades Apprenticeship / Certificate', stageLevel: 5, isSecondaryGate: false },
      { id: 'ca_bachelor', label: "Bachelor's Degree (3 or 4-Year Honours)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ca_master', label: "Master's Degree / Post-Graduate Certificate", stageLevel: 7, isSecondaryGate: false },
      { id: 'ca_doctorate', label: 'Doctorate / PhD / Professional Degree (MD, LLB)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grade 10 Secondary',
    grade12EquivName: 'High School Diploma (Grade 12)',
    vocationalSystemName: 'Colleges of Applied Arts & Technology & Red Seal Trades',
    primaryLanguage: 'English & French'
  },
  {
    countryCode: 'MX',
    countryName: 'Mexico',
    region: 'North America',
    flagEmoji: '🇲🇽',
    educationFrameworkName: 'Sistema Educativo Nacional (SEP) / Marco Curricular Común',
    educationStages: [
      { id: 'mx_secundaria', label: 'Secundaria Completa (Grade 9 / 3er año)', stageLevel: 2, isSecondaryGate: true },
      { id: 'mx_preparatoria', label: 'Preparatoria / Bachillerato General (Grade 10-12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'mx_conalep', label: 'Bachillerato Técnico / Profesional Técnico (CONALEP / CBTIS)', stageLevel: 4, isSecondaryGate: false },
      { id: 'mx_tsu', label: 'Técnico Superior Universitario (TSU - 2 años)', stageLevel: 5, isSecondaryGate: false },
      { id: 'mx_licenciatura', label: "Licenciatura / Ingeniería (4-5 años con Título y Cédula)", stageLevel: 6, isSecondaryGate: false },
      { id: 'mx_maestria', label: "Maestría / Posgrado", stageLevel: 7, isSecondaryGate: false },
      { id: 'mx_doctorado', label: 'Doctorado', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Secundaria Completa',
    grade12EquivName: 'Bachillerato / Preparatoria',
    vocationalSystemName: 'CONALEP, CBTIS & Universidades Tecnológicas (TSU)',
    primaryLanguage: 'Spanish'
  },

  // --- EUROPE ---
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    region: 'Europe',
    flagEmoji: '🇬🇧',
    educationFrameworkName: 'Regulated Qualifications Framework (RQF / SCQF in Scotland)',
    educationStages: [
      { id: 'uk_gcse', label: 'GCSEs / Year 11 (Key Stage 4)', stageLevel: 2, isSecondaryGate: true },
      { id: 'uk_a_levels', label: 'A-Levels / Year 12-13 (Academic Route)', stageLevel: 4, isSecondaryGate: false },
      { id: 'uk_t_levels', label: 'T-Levels (2-year technical qualification with 45-day industry placement)', stageLevel: 4, isSecondaryGate: false },
      { id: 'uk_btec', label: 'BTEC National / NVQ Level 3 Diploma', stageLevel: 4, isSecondaryGate: false },
      { id: 'uk_degree_apprentice', label: 'Higher / Degree Apprenticeship (Levels 4-7 with full employer salary)', stageLevel: 6, isSecondaryGate: false },
      { id: 'uk_hnd_fdsc', label: 'Higher National Diploma (HND) / Foundation Degree (Level 5)', stageLevel: 5, isSecondaryGate: false },
      { id: 'uk_bachelor', label: "Bachelor's Degree with Honours (BSc / BA / BEng - Level 6)", stageLevel: 6, isSecondaryGate: false },
      { id: 'uk_master', label: "Master's Degree (MSc / MA / MEng / MBA - Level 7)", stageLevel: 7, isSecondaryGate: false },
      { id: 'uk_doctorate', label: 'Doctorate (PhD / DPhil - Level 8)', stageLevel: 8, isSecondaryGate: false },
      { id: 'uk_chartered', label: 'Chartered Professional Status (CEng, ACCA, ACA, CIPS, CIPD)', stageLevel: 7, isSecondaryGate: false }
    ],
    grade10EquivName: 'GCSEs (Year 11)',
    grade12EquivName: 'A-Levels / T-Levels / BTEC Nationals (Year 13)',
    vocationalSystemName: 'T-Levels, BTECs & Modern Degree Apprenticeships',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'IE',
    countryName: 'Ireland',
    region: 'Europe',
    flagEmoji: '🇮🇪',
    educationFrameworkName: 'National Framework of Qualifications (NFQ Levels 1-10)',
    educationStages: [
      { id: 'ie_junior_cycle', label: 'Junior Cycle (NFQ Level 3 - Age 15/16)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ie_leaving_cert', label: 'Leaving Certificate (NFQ Levels 4/5 - Age 17/18)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ie_plcs', label: 'Post Leaving Certificate (PLC) / Higher Certificate (NFQ 6)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ie_apprentice', label: 'National Apprenticeship Scheme (SOLAS)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ie_bachelor', label: "Honours Bachelor Degree (NFQ Level 8)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ie_master', label: "Master's Degree / Postgrad Diploma (NFQ Level 9)", stageLevel: 7, isSecondaryGate: false },
      { id: 'ie_doctorate', label: 'Doctoral Degree (NFQ Level 10)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Junior Cycle Certificate',
    grade12EquivName: 'Leaving Certificate',
    vocationalSystemName: 'SOLAS Apprenticeships & PLC Courses (NFQ 5-6)',
    primaryLanguage: 'English & Irish'
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    region: 'Europe',
    flagEmoji: '🇩🇪',
    educationFrameworkName: 'Deutscher Qualifikationsrahmen (DQR) & Duale Ausbildung System',
    educationStages: [
      { id: 'de_haupt_real', label: 'Hauptschulabschluss / Realschulabschluss (Mittlere Reife - 10. Klasse)', stageLevel: 2, isSecondaryGate: true },
      { id: 'de_abitur', label: 'Abitur / Fachabitur (Allgemeine Hochschulreife - Gymnasiale Oberstufe)', stageLevel: 4, isSecondaryGate: false },
      { id: 'de_ausbildung', label: 'Duale Ausbildung (3-year State Certified Apprenticeship with Chamber IHK/HWK)', stageLevel: 5, isSecondaryGate: false },
      { id: 'de_meister_fachwirt', label: 'Meister / Fachwirt / Techniker (DQR Level 6 - Equal to Bachelor)', stageLevel: 6, isSecondaryGate: false },
      { id: 'de_duales_studium', label: 'Duales Studium (Combined Company Contract + University Bachelor)', stageLevel: 6, isSecondaryGate: false },
      { id: 'de_bachelor', label: "Bachelor's Degree (Universität oder Fachhochschule - B.Sc / B.A / B.Eng)", stageLevel: 6, isSecondaryGate: false },
      { id: 'de_master', label: "Master's Degree (M.Sc / M.A / Staatsexamen for Med/Law)", stageLevel: 7, isSecondaryGate: false },
      { id: 'de_promotion', label: 'Promotion / Doktorat (Dr. rer. nat. / Dr.-Ing.)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Realschulabschluss / Mittlere Reife (10. Klasse)',
    grade12EquivName: 'Abitur / Fachhochschulreife (12./13. Klasse)',
    vocationalSystemName: 'Duale Ausbildung & Fachschulen (Meister/Techniker)',
    primaryLanguage: 'German'
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    region: 'Europe',
    flagEmoji: '🇫🇷',
    educationFrameworkName: 'Répertoire National des Certifications Professionnelles (RNCP / LMD)',
    educationStages: [
      { id: 'fr_brevet', label: 'Diplôme National du Brevet (Troisième - 9e année)', stageLevel: 2, isSecondaryGate: true },
      { id: 'fr_bac', label: 'Baccalauréat Général ou Technologique (Lycée - Bac)', stageLevel: 4, isSecondaryGate: false },
      { id: 'fr_cap_bacpro', label: 'Bac Professionnel / CAP (Certificat d’Aptitude Professionnelle)', stageLevel: 4, isSecondaryGate: false },
      { id: 'fr_bts_but', label: 'BTS / BUT (Bachelor Universitaire de Technologie - Bac+2 / Bac+3)', stageLevel: 5, isSecondaryGate: false },
      { id: 'fr_licence', label: 'Licence / Licence Professionnelle (Bac+3 - Université)', stageLevel: 6, isSecondaryGate: false },
      { id: 'fr_grande_ecole', label: 'Grandes Écoles (Diplôme d’Ingénieur / Programme Grande École - Bac+5)', stageLevel: 7, isSecondaryGate: false },
      { id: 'fr_master', label: 'Master Universitaire (Bac+5)', stageLevel: 7, isSecondaryGate: false },
      { id: 'fr_doctorat', label: 'Doctorat (Bac+8 / Thèse)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Brevet des Collèges (3ème)',
    grade12EquivName: 'Baccalauréat (Bac Général / Techno / Pro)',
    vocationalSystemName: 'BTS, BUT & Apprentissage en Alternance',
    primaryLanguage: 'French'
  },
  {
    countryCode: 'ES',
    countryName: 'Spain',
    region: 'Europe',
    flagEmoji: '🇪🇸',
    educationFrameworkName: 'Marco Español de Cualificaciones (MECES / FP)',
    educationStages: [
      { id: 'es_eso', label: 'Graduado en ESO (Educación Secundaria Obligatoria - 4º ESO)', stageLevel: 2, isSecondaryGate: true },
      { id: 'es_bachillerato', label: 'Bachillerato (Modalidades: Ciencias, Humanidades, Artes)', stageLevel: 4, isSecondaryGate: false },
      { id: 'es_fp_medio', label: 'Formación Profesional de Grado Medio (Técnico - FP Medio)', stageLevel: 4, isSecondaryGate: false },
      { id: 'es_fp_superior', label: 'FP de Grado Superior (Técnico Superior - FP Superior)', stageLevel: 5, isSecondaryGate: false },
      { id: 'es_grado', label: 'Grado Universitario (4 años - 240 ECTS)', stageLevel: 6, isSecondaryGate: false },
      { id: 'es_master', label: 'Máster Universitario Oficial (1-2 años)', stageLevel: 7, isSecondaryGate: false },
      { id: 'es_doctorado', label: 'Doctorado', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: '4º de la ESO (Graduado en Secundaria)',
    grade12EquivName: 'Bachillerato / Selectividad (EvAU)',
    vocationalSystemName: 'Formación Profesional (FP Grado Medio y Superior)',
    primaryLanguage: 'Spanish'
  },
  {
    countryCode: 'IT',
    countryName: 'Italy',
    region: 'Europe',
    flagEmoji: '🇮🇹',
    educationFrameworkName: 'Quadro Nazionale delle Qualificazioni (QNQ / Processo di Bologna)',
    educationStages: [
      { id: 'it_terza_media', label: 'Diploma di Scuola Secondaria di Primo Grado (Terza Media)', stageLevel: 2, isSecondaryGate: true },
      { id: 'it_maturita', label: 'Diploma di Maturità (Liceo / Istituto Tecnico / Professionale - 5 anni)', stageLevel: 4, isSecondaryGate: false },
      { id: 'it_its', label: 'ITS Academy (Istituti Tecnici Superiori - 2 anni post-diploma)', stageLevel: 5, isSecondaryGate: false },
      { id: 'it_laurea_triennale', label: 'Laurea Triennale (Primo ciclo universitario - 3 anni)', stageLevel: 6, isSecondaryGate: false },
      { id: 'it_laurea_magistrale', label: 'Laurea Magistrale / Specialistica (Secondo ciclo - 2 anni o ciclo unico)', stageLevel: 7, isSecondaryGate: false },
      { id: 'it_dottorato', label: 'Dottorato di Ricerca (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Terza Media / Primo Biennio Superiori',
    grade12EquivName: 'Diploma di Maturità (Esame di Stato)',
    vocationalSystemName: 'Istituti Tecnici & ITS Academies',
    primaryLanguage: 'Italian'
  },
  {
    countryCode: 'NL',
    countryName: 'Netherlands',
    region: 'Europe',
    flagEmoji: '🇳🇱',
    educationFrameworkName: 'Dutch Qualifications Framework (NLQF) & 3-Tier Secondary System',
    educationStages: [
      { id: 'nl_vmbo', label: 'VMBO Diploma (Pre-vocational - Age 16)', stageLevel: 2, isSecondaryGate: true },
      { id: 'nl_havo', label: 'HAVO Diploma (Senior General Secondary - 5 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'nl_vwo', label: 'VWO Diploma (Pre-university Gymnasium/Atheneum - 6 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'nl_mbo', label: 'MBO Diploma (Levels 2-4 Vocational Education & Dual BBL/BOL)', stageLevel: 5, isSecondaryGate: false },
      { id: 'nl_hbo_bachelor', label: "HBO Bachelor (Applied Sciences University - 4 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'nl_wo_bachelor', label: "WO Bachelor (Research University - 3 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'nl_master', label: "Master's Degree (HBO or WO Master)", stageLevel: 7, isSecondaryGate: false },
      { id: 'nl_phd', label: 'Doctorate (Promotie / PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'VMBO / Year 4 HAVO-VWO',
    grade12EquivName: 'HAVO / VWO / MBO Level 4 Diploma',
    vocationalSystemName: 'MBO Colleges & Hogescholen (HBO Universities of Applied Sciences)',
    primaryLanguage: 'Dutch & English'
  },
  {
    countryCode: 'BE',
    countryName: 'Belgium',
    region: 'Europe',
    flagEmoji: '🇧🇪',
    educationFrameworkName: 'Flemish / Francophone Qualifications Frameworks (VKS / CFC)',
    educationStages: [
      { id: 'be_sec_2', label: '2nd Stage Secondary (Age 16 - ASO/TSO/BSO/KSO)', stageLevel: 2, isSecondaryGate: true },
      { id: 'be_cess_cess', label: 'CESS / Diploma Secundair Onderwijs (Age 18)', stageLevel: 4, isSecondaryGate: false },
      { id: 'be_graduaat', label: 'Graduaat / Brevet d’Enseignement Supérieur (HBO5 - 2 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'be_prof_bachelor', label: "Professional Bachelor (Hogeschool / Haute École - 3 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'be_acad_bachelor', label: "Academic Bachelor (Universiteit / Université)", stageLevel: 6, isSecondaryGate: false },
      { id: 'be_master', label: "Master's Degree", stageLevel: 7, isSecondaryGate: false },
      { id: 'be_doctorate', label: 'Doctorat / Doctoraat', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: '4e Middelbaar / 4e Secondaire',
    grade12EquivName: 'Diploma Secundair Onderwijs / CESS',
    vocationalSystemName: 'Hogescholen & Syntra / IFAPME Dual Apprenticeships',
    primaryLanguage: 'Dutch & French'
  },
  {
    countryCode: 'CH',
    countryName: 'Switzerland',
    region: 'Europe',
    flagEmoji: '🇨🇭',
    educationFrameworkName: 'National Qualifications Framework Switzerland (NQR / Duales System)',
    educationStages: [
      { id: 'ch_sek_1', label: 'Sekundarstufe I (Obligatorische Schulzeit - 9. Schuljahr)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ch_efz', label: 'Berufslehre EFZ (Eidgenössisches Fähigkeitszeugnis - 3-4 Jahre Dual)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ch_maturitat', label: 'Gymnasiale Maturität / Berufsmaturität (BMS)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ch_hfs', label: 'Höhere Fachschule (HF) / Eidg. Diplom (Höhere Berufsbildung)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ch_fachhochschule', label: 'Fachhochschule (FH) Bachelor / Pädagogische Hochschule', stageLevel: 6, isSecondaryGate: false },
      { id: 'ch_uni_bachelor', label: 'Universität / ETH Zürich / EPFL Bachelor', stageLevel: 6, isSecondaryGate: false },
      { id: 'ch_master', label: "Master's Degree (FH oder Universität/ETH)", stageLevel: 7, isSecondaryGate: false },
      { id: 'ch_doktorat', label: 'Doktorat / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: '9. Schuljahr / Sekundarstufe I Abschluss',
    grade12EquivName: 'EFZ Berufslehre / Gymnasiale Maturität',
    vocationalSystemName: 'Berufslehre EFZ & Höhere Fachschulen (HF)',
    primaryLanguage: 'German, French, Italian & English'
  },
  {
    countryCode: 'AT',
    countryName: 'Austria',
    region: 'Europe',
    flagEmoji: '🇦🇹',
    educationFrameworkName: 'Nationaler Qualifikationsrahmen (NQR Österreich)',
    educationStages: [
      { id: 'at_sek_1', label: 'Hauptschule / Mittelschule Abschluss (8./9. Schulstufe)', stageLevel: 2, isSecondaryGate: true },
      { id: 'at_matura', label: 'Matura (AHS oder BHS - 5-jährige HTL / HAK / HLW)', stageLevel: 4, isSecondaryGate: false },
      { id: 'at_lehrabschluss', label: 'Lehrabschlussprüfung (Duale Lehrausbildung mit Berufsschule)', stageLevel: 4, isSecondaryGate: false },
      { id: 'at_meister', label: 'Meisterprüfung / Werkmeister (NQR 6 - Gleichgestellt mit Bachelor)', stageLevel: 6, isSecondaryGate: false },
      { id: 'at_fh_bachelor', label: 'Fachhochschule (FH) Bachelor', stageLevel: 6, isSecondaryGate: false },
      { id: 'at_uni_bachelor', label: 'Universität Bachelor', stageLevel: 6, isSecondaryGate: false },
      { id: 'at_master', label: "Master's Degree / Diplomstudium", stageLevel: 7, isSecondaryGate: false },
      { id: 'at_doktorat', label: 'Doktorat / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Mittelschule / 9. Schulstufe (Polytechnische Schule)',
    grade12EquivName: 'Matura (Reifeprüfung) / Lehrabschluss',
    vocationalSystemName: 'HTL/HAK 5-Year Technical Colleges & Duale Lehre',
    primaryLanguage: 'German'
  },
  {
    countryCode: 'SE',
    countryName: 'Sweden',
    region: 'Europe',
    flagEmoji: '🇸🇪',
    educationFrameworkName: 'Swedish National Qualifications Framework (SeQF)',
    educationStages: [
      { id: 'se_grundskola', label: 'Grundskola (Year 9 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'se_gymnasium', label: 'Gymnasieexamen (Academic or Vocational Programmes - 3 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'se_yrkeshogskola', label: 'Yrkeshögskola (YH - Higher Vocational Education 1-2 years with LIA internship)', stageLevel: 5, isSecondaryGate: false },
      { id: 'se_kandidatexamen', label: "Kandidatexamen (Bachelor's Degree - 3 years / 180 HP)", stageLevel: 6, isSecondaryGate: false },
      { id: 'se_master', label: "Masterexamen (1-2 year Master's Degree)", stageLevel: 7, isSecondaryGate: false },
      { id: 'se_doktor', label: 'Doktorsexamen (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grundskola Slutbetyg (Grade 9)',
    grade12EquivName: 'Gymnasieexamen (Grade 12)',
    vocationalSystemName: 'Yrkeshögskolan (YH) with Industry LIA',
    primaryLanguage: 'Swedish & English'
  },
  {
    countryCode: 'NO',
    countryName: 'Norway',
    region: 'Europe',
    flagEmoji: '🇳🇴',
    educationFrameworkName: 'Norwegian Qualifications Framework (NKR)',
    educationStages: [
      { id: 'no_grunnskole', label: 'Grunnskole (Grade 10 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'no_studiespesialisering', label: 'Videregående Skole (VGS - Studiespesialisering General)', stageLevel: 4, isSecondaryGate: false },
      { id: 'no_fagbrev', label: 'Yrkesfag med Fagbrev / Svennebrev (2 years school + 2 years apprenticeship)', stageLevel: 4, isSecondaryGate: false },
      { id: 'no_fagskole', label: 'Fagskoleutdanning (Higher Vocational College - 1-2 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'no_bachelor', label: "Bachelor's Degree (3 years / 180 ECTS)", stageLevel: 6, isSecondaryGate: false },
      { id: 'no_master', label: "Master's Degree (2 years)", stageLevel: 7, isSecondaryGate: false },
      { id: 'no_phd', label: 'Doktorgrad (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grunnskolen Vitnemål',
    grade12EquivName: 'Generell Studiekompetanse (VGS) / Fagbrev',
    vocationalSystemName: 'Yrkesfag (Fagbrev) & Fagskole',
    primaryLanguage: 'Norwegian & English'
  },
  {
    countryCode: 'DK',
    countryName: 'Denmark',
    region: 'Europe',
    flagEmoji: '🇩🇰',
    educationFrameworkName: 'Danish Qualifications Framework (NQF Denmark)',
    educationStages: [
      { id: 'dk_folkeskole', label: 'Folkeskolen (Grade 9/10 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'dk_gymnasium', label: 'Gymnasium (STX / HHX / HTX / HF Upper Secondary)', stageLevel: 4, isSecondaryGate: false },
      { id: 'dk_eud', label: 'Erhvervsuddannelse (EUD / EUX Vocational Apprenticeship)', stageLevel: 4, isSecondaryGate: false },
      { id: 'dk_erhvervsakademi', label: 'Erhvervsakademi (Academy Profession AP Degree - 2 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'dk_prof_bachelor', label: 'Professionsbachelor (University College - 3.5 years)', stageLevel: 6, isSecondaryGate: false },
      { id: 'dk_uni_bachelor', label: 'Universitetsbachelor (Research University - 3 years)', stageLevel: 6, isSecondaryGate: false },
      { id: 'dk_kandidat', label: "Kandidatuddannelse (Master's Degree - 2 years)", stageLevel: 7, isSecondaryGate: false },
      { id: 'dk_phd', label: 'Ph.d.-grad', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Folkeskolens Afgangsprøve (9./10. klasse)',
    grade12EquivName: 'Studentereksamen (STX/HHX/HTX) / Svendebrev',
    vocationalSystemName: 'Erhvervsakademier & EUD Vocational Schools',
    primaryLanguage: 'Danish & English'
  },
  {
    countryCode: 'FI',
    countryName: 'Finland',
    region: 'Europe',
    flagEmoji: '🇫🇮',
    educationFrameworkName: 'Finnish National Framework for Qualifications (FiNQF)',
    educationStages: [
      { id: 'fi_peruskoulu', label: 'Peruskoulu (Comprehensive School - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'fi_lukio', label: 'Lukio (General Upper Secondary School - Matriculation Examination)', stageLevel: 4, isSecondaryGate: false },
      { id: 'fi_ammatillinen', label: 'Ammatillinen perustutkinto (Vocational Upper Secondary Qualification)', stageLevel: 4, isSecondaryGate: false },
      { id: 'fi_amk_bachelor', label: 'Ammattikorkeakoulututkinto (AMK Bachelor - Applied Sciences)', stageLevel: 6, isSecondaryGate: false },
      { id: 'fi_uni_bachelor', label: 'Kandidaatin tutkinto (University Bachelor)', stageLevel: 6, isSecondaryGate: false },
      { id: 'fi_master', label: "Maisterin tutkinto / Ylempi AMK (Master's Degree)", stageLevel: 7, isSecondaryGate: false },
      { id: 'fi_tohtori', label: 'Tohtorin tutkinto (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Peruskoulun Päättötodistus',
    grade12EquivName: 'Ylioppilastutkinto (Lukio) / Ammatillinen Perustutkinto',
    vocationalSystemName: 'Ammattikorkeakoulu (AMK) & Ammattiopistot',
    primaryLanguage: 'Finnish & Swedish & English'
  },
  {
    countryCode: 'PL',
    countryName: 'Poland',
    region: 'Europe',
    flagEmoji: '🇵🇱',
    educationFrameworkName: 'Polska Rama Kwalifikacji (PRK Levels 1-8)',
    educationStages: [
      { id: 'pl_podstawowa', label: 'Szkoła Podstawowa (Grade 8 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'pl_liceum', label: 'Liceum Ogólnokształcące (Matura Certificate - 4 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'pl_technikum', label: 'Technikum (Matura + Dyplom Zawodowy - 5 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'pl_szkola_policealna', label: 'Szkoła Policealna (Post-secondary vocational college)', stageLevel: 5, isSecondaryGate: false },
      { id: 'pl_licencjat_inzynier', label: 'Licencjat (3 lata) / Inżynier (3.5 roku - Studia I stopnia)', stageLevel: 6, isSecondaryGate: false },
      { id: 'pl_magister', label: 'Magister / Magister Inżynier (Studia II stopnia)', stageLevel: 7, isSecondaryGate: false },
      { id: 'pl_doktorat', label: 'Doktorat (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Egzamin Ósmoklasisty',
    grade12EquivName: 'Świadectwo Dojrzałości (Matura)',
    vocationalSystemName: 'Technikum & Szkoły Branżowe',
    primaryLanguage: 'Polish'
  },
  {
    countryCode: 'PT',
    countryName: 'Portugal',
    region: 'Europe',
    flagEmoji: '🇵🇹',
    educationFrameworkName: 'Quadro Nacional de Qualificações (QNQ Portugal)',
    educationStages: [
      { id: 'pt_3_ciclo', label: '3º Ciclo do Ensino Básico (9º Ano)', stageLevel: 2, isSecondaryGate: true },
      { id: 'pt_ensino_secundario', label: 'Ensino Secundário (Cursos Científico-Humanísticos - 12º Ano)', stageLevel: 4, isSecondaryGate: false },
      { id: 'pt_cursos_profissionais', label: 'Cursos Profissionais (Dupla Certificação Nível 4)', stageLevel: 4, isSecondaryGate: false },
      { id: 'pt_tesp', label: 'CTeSP (Cursos Técnicos Superiores Profissionais - Nível 5 / 2 anos)', stageLevel: 5, isSecondaryGate: false },
      { id: 'pt_licenciatura', label: 'Licenciatura (3 anos - 180 ECTS / Politécnico ou Universidade)', stageLevel: 6, isSecondaryGate: false },
      { id: 'pt_mestrado', label: 'Mestrado (2 anos)', stageLevel: 7, isSecondaryGate: false },
      { id: 'pt_doutoramento', label: 'Doutoramento (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: '9º Ano do Ensino Básico',
    grade12EquivName: '12º Ano (Diploma do Ensino Secundário)',
    vocationalSystemName: 'Institutos Politécnicos & Escolas Profissionais',
    primaryLanguage: 'Portuguese'
  },
  {
    countryCode: 'CZ',
    countryName: 'Czech Republic',
    region: 'Europe',
    flagEmoji: '🇨🇿',
    educationFrameworkName: 'Národní Rámec Kvalifikací (NKR ČR)',
    educationStages: [
      { id: 'cz_zakladni', label: 'Základní Škola (Grade 9 Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'cz_gymnazium', label: 'Gymnázium (Maturita Examination - 4 years)', stageLevel: 4, isSecondaryGate: false },
      { id: 'cz_stredni_odborna', label: 'Střední Odborná Škola (SOŠ - Vocational with Maturita)', stageLevel: 4, isSecondaryGate: false },
      { id: 'cz_vos', label: 'Vyšší Odborná Škola (VOŠ - Diplomovaný specialista DiS. - 3 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'cz_bakalar', label: "Bakalářský Studijní Program (Bc. / BcA. - 3 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'cz_magistr_inzenyr', label: "Magisterský Program (Mgr. / Ing. - 2 years)", stageLevel: 7, isSecondaryGate: false },
      { id: 'cz_doktor', label: 'Doktorský Program (Ph.D.)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Vysvědčení ze Základní Školy (9. třída)',
    grade12EquivName: 'Maturitní Vysvědčení (Maturita)',
    vocationalSystemName: 'Vyšší Odborné Školy (VOŠ) & SOŠ',
    primaryLanguage: 'Czech'
  },
  {
    countryCode: 'GR',
    countryName: 'Greece',
    region: 'Europe',
    flagEmoji: '🇬🇷',
    educationFrameworkName: 'Hellenic Qualifications Framework (HQF Levels 1-8)',
    educationStages: [
      { id: 'gr_gymnasio', label: 'Gymnasio (Lower Secondary - 3 years)', stageLevel: 2, isSecondaryGate: true },
      { id: 'gr_gel', label: 'Geniko Lykeio (General Upper Secondary - Apolytirio)', stageLevel: 4, isSecondaryGate: false },
      { id: 'gr_epal', label: 'Epangelmatiko Lykeio (Vocational Upper Secondary - EPAL)', stageLevel: 4, isSecondaryGate: false },
      { id: 'gr_iek', label: 'IEK Diploma (Institutes of Vocational Training - Level 5)', stageLevel: 5, isSecondaryGate: false },
      { id: 'gr_ptychio', label: "Ptychio (Bachelor's Degree - University 4-5 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'gr_metaptychiako', label: "Metaptychiako (Master's Degree - 1-2 years)", stageLevel: 7, isSecondaryGate: false },
      { id: 'gr_didaktoriko', label: 'Didaktoriko (PhD)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Apolytirio Gymnasiou',
    grade12EquivName: 'Apolytirio Lykeiou (Panhellenic Exams)',
    vocationalSystemName: 'EPAL & Public IEKs',
    primaryLanguage: 'Greek'
  },

  // --- OCEANIA ---
  {
    countryCode: 'AU',
    countryName: 'Australia',
    region: 'Oceania',
    flagEmoji: '🇦🇺',
    educationFrameworkName: 'Australian Qualifications Framework (AQF Levels 1-10)',
    educationStages: [
      { id: 'au_year_10', label: 'Year 10 (RoSA / Junior Secondary Certificate)', stageLevel: 2, isSecondaryGate: true },
      { id: 'au_year_12', label: 'Year 12 (HSC, VCE, QCE, WACE, SACE with ATAR)', stageLevel: 4, isSecondaryGate: false },
      { id: 'au_vet_cert_3_4', label: 'TAFE / VET Certificate III & IV (AQF Levels 3-4)', stageLevel: 5, isSecondaryGate: false },
      { id: 'au_diploma', label: 'Diploma / Advanced Diploma (AQF Levels 5-6 / TAFE)', stageLevel: 5, isSecondaryGate: false },
      { id: 'au_bachelor', label: "Bachelor Degree (AQF Level 7 - 3-4 Years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'au_bachelor_honours', label: 'Bachelor Honours Degree / Graduate Diploma (AQF Level 8)', stageLevel: 6, isSecondaryGate: false },
      { id: 'au_master', label: "Master's Degree (Coursework or Research - AQF Level 9)", stageLevel: 7, isSecondaryGate: false },
      { id: 'au_doctorate', label: 'Doctoral Degree (PhD - AQF Level 10)', stageLevel: 8, isSecondaryGate: false },
      { id: 'au_trade_apprentice', label: 'Australian Apprenticeship / Trade Certificate', stageLevel: 5, isSecondaryGate: false }
    ],
    grade10EquivName: 'Year 10 School Certificate (RoSA)',
    grade12EquivName: 'Senior Secondary Certificate of Education (Year 12 / ATAR)',
    vocationalSystemName: 'TAFE Institutes & Registered Training Organisations (RTOs)',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    region: 'Oceania',
    flagEmoji: '🇳🇿',
    educationFrameworkName: 'New Zealand Qualifications Framework (NZQF Levels 1-10)',
    educationStages: [
      { id: 'nz_ncea_1', label: 'Year 11 (NCEA Level 1)', stageLevel: 2, isSecondaryGate: true },
      { id: 'nz_ncea_2_3', label: 'Year 12-13 (NCEA Level 2 & 3 / University Entrance UE)', stageLevel: 4, isSecondaryGate: false },
      { id: 'nz_polytechnic', label: 'Te Pūkenga / Polytechnic Diploma (NZQF Levels 5-6)', stageLevel: 5, isSecondaryGate: false },
      { id: 'nz_bachelor', label: "Bachelor's Degree (NZQF Level 7 - 3 Years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'nz_postgrad_diploma', label: 'Postgraduate Diploma / Honours (NZQF Level 8)', stageLevel: 7, isSecondaryGate: false },
      { id: 'nz_master', label: "Master's Degree (NZQF Level 9)", stageLevel: 7, isSecondaryGate: false },
      { id: 'nz_doctorate', label: 'Doctoral Degree (PhD - NZQF Level 10)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Year 11 / NCEA Level 1',
    grade12EquivName: 'NCEA Level 3 (University Entrance)',
    vocationalSystemName: 'Te Pūkenga (New Zealand Institute of Skills and Technology)',
    primaryLanguage: 'English & Māori'
  },

  // --- AFRICA ---
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    region: 'Africa',
    flagEmoji: '🇿🇦',
    educationFrameworkName: 'National Qualifications Framework (NQF / SAQA Levels 1-10)',
    educationStages: [
      { id: 'za_grade_9_10', label: 'Grade 9 / 10 (GET Band Completion)', stageLevel: 2, isSecondaryGate: true },
      { id: 'za_matric', label: 'National Senior Certificate (Matric / Grade 12 - NQF 4)', stageLevel: 4, isSecondaryGate: false },
      { id: 'za_tvet_ncv', label: 'TVET College NC(V) / Nated N1-N6 Diploma (NQF 4-6)', stageLevel: 5, isSecondaryGate: false },
      { id: 'za_bachelor', label: "Bachelor's Degree (NQF Level 7 - 3-4 Years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'za_honours', label: 'Honours Degree / Postgraduate Diploma (NQF Level 8)', stageLevel: 7, isSecondaryGate: false },
      { id: 'za_master', label: "Master's Degree (NQF Level 9)", stageLevel: 7, isSecondaryGate: false },
      { id: 'za_doctorate', label: 'Doctoral Degree / PhD (NQF Level 10)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grade 9 General Education Certificate / Grade 10',
    grade12EquivName: 'National Senior Certificate (Matric)',
    vocationalSystemName: 'TVET Colleges (N1-N6 National Diplomas)',
    primaryLanguage: 'English, isiZulu, isiXhosa, Afrikaans & 7 other languages'
  },
  {
    countryCode: 'EG',
    countryName: 'Egypt',
    region: 'Africa',
    flagEmoji: '🇪🇬',
    educationFrameworkName: 'Egyptian National Qualifications Framework (NQF Egypt)',
    educationStages: [
      { id: 'eg_prep', label: 'Preparatory Certificate (Idadiya - Grade 9)', stageLevel: 2, isSecondaryGate: true },
      { id: 'eg_thanawiya', label: 'General Secondary Certificate (Thanawiya Amma - Grade 12)', stageLevel: 4, isSecondaryGate: false },
      { id: 'eg_technical_secondary', label: 'Technical Secondary Diploma (3 or 5-year Technical School)', stageLevel: 4, isSecondaryGate: false },
      { id: 'eg_intermediate_institute', label: 'Higher Institute / Intermediate Diploma (2 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'eg_bachelor', label: "Bachelor's Degree (Bakalorios / Lisans - 4-5 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'eg_master', label: "Master's Degree (Magisteer)", stageLevel: 7, isSecondaryGate: false },
      { id: 'eg_doctorate', label: 'Doctorate (Doktorah)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Idadiya Certificate (Grade 9)',
    grade12EquivName: 'Thanawiya Amma (General Secondary)',
    vocationalSystemName: 'Applied Technology Schools & Higher Technical Institutes',
    primaryLanguage: 'Arabic & English'
  },
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    region: 'Africa',
    flagEmoji: '🇳🇬',
    educationFrameworkName: 'Nigerian Skills Qualifications Framework (NSQF / 6-3-3-4)',
    educationStages: [
      { id: 'ng_jss', label: 'Junior Secondary School (JSCE / BECE - JSS 3)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ng_waec_neco', label: 'Senior Secondary School (WAEC / NECO / WASSCE - SSS 3)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ng_ond', label: 'Ordinary National Diploma (OND - 2 years Polytechnic / Monotechnic)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ng_hnd', label: 'Higher National Diploma (HND - 2 years post-OND with 1 yr IT)', stageLevel: 6, isSecondaryGate: false },
      { id: 'ng_bachelor', label: "Bachelor's Degree (B.Sc / B.Tech / B.Eng / MBBS - 4-6 years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ng_master', label: "Master's Degree (M.Sc / MBA / M.Tech)", stageLevel: 7, isSecondaryGate: false },
      { id: 'ng_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'BECE / Junior Secondary (JSS3)',
    grade12EquivName: 'WASSCE (WAEC) / NECO (SSS3)',
    vocationalSystemName: 'NBTE Accredited Polytechnics & Technical Colleges (OND/HND)',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    region: 'Africa',
    flagEmoji: '🇰🇪',
    educationFrameworkName: 'Kenya National Qualifications Framework (KNQF / CBC System)',
    educationStages: [
      { id: 'ke_kcpe_junior', label: 'Junior Secondary School (Grade 9 / KCPE Completer)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ke_kcse', label: 'Senior School / KCSE Certificate (Kenya Certificate of Secondary Education)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ke_tvet_artisan', label: 'TVET Artisan & Craft Certificate (KNQF Level 3-4)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ke_tvet_diploma', label: 'National Polytechnic Diploma (KNQF Level 6)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ke_bachelor', label: "Bachelor's Degree (KNQF Level 7 - 4 Years)", stageLevel: 6, isSecondaryGate: false },
      { id: 'ke_master', label: "Master's Degree (KNQF Level 9)", stageLevel: 7, isSecondaryGate: false },
      { id: 'ke_doctorate', label: 'Doctorate / PhD (KNQF Level 10)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Grade 9 Junior Secondary / KCPE',
    grade12EquivName: 'KCSE Certificate (Form 4)',
    vocationalSystemName: 'TVETA Accredited National Polytechnics & VTCs',
    primaryLanguage: 'English & Swahili'
  },
  {
    countryCode: 'GH',
    countryName: 'Ghana',
    region: 'Africa',
    flagEmoji: '🇬🇭',
    educationFrameworkName: 'National TVET Qualifications Framework (NTVETQF / COTVET)',
    educationStages: [
      { id: 'gh_bece', label: 'Basic Education Certificate Examination (BECE / JHS 3)', stageLevel: 2, isSecondaryGate: true },
      { id: 'gh_wassce', label: 'West African Senior School Certificate (WASSCE / SHS 3)', stageLevel: 4, isSecondaryGate: false },
      { id: 'gh_hnd', label: 'Higher National Diploma (HND - Technical University 3 years)', stageLevel: 5, isSecondaryGate: false },
      { id: 'gh_bachelor', label: "Bachelor's Degree (B.Sc / BA / B.Tech)", stageLevel: 6, isSecondaryGate: false },
      { id: 'gh_master', label: "Master's Degree (M.Sc / M.Phil / MBA)", stageLevel: 7, isSecondaryGate: false },
      { id: 'gh_doctorate', label: 'Doctorate / PhD', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'BECE Examination (JHS 3)',
    grade12EquivName: 'WASSCE Examination (SHS 3)',
    vocationalSystemName: 'Technical Universities & NVTI Vocational Centers',
    primaryLanguage: 'English'
  },
  {
    countryCode: 'MA',
    countryName: 'Morocco',
    region: 'Africa',
    flagEmoji: '🇲🇦',
    educationFrameworkName: 'Cadre National des Certifications (CNC Maroc / OFPPT)',
    educationStages: [
      { id: 'ma_brevet', label: 'Brevet d’Enseignement Fondamental (3ème Année Collège)', stageLevel: 2, isSecondaryGate: true },
      { id: 'ma_bac', label: 'Baccalauréat National ou International (Lycée)', stageLevel: 4, isSecondaryGate: false },
      { id: 'ma_ofppt_ts', label: 'Technicien Spécialisé OFPPT (DTS - 2 ans post-Bac)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ma_bts_dut', label: 'BTS / DUT (Diplôme Universitaire de Technologie - 2 ans)', stageLevel: 5, isSecondaryGate: false },
      { id: 'ma_licence', label: 'Licence Fondamentale ou Professionnelle (Bac+3)', stageLevel: 6, isSecondaryGate: false },
      { id: 'ma_ingenieur_master', label: 'Diplôme d’Ingénieur d’État / Master (Bac+5)', stageLevel: 7, isSecondaryGate: false },
      { id: 'ma_doctorat', label: 'Doctorat (Bac+8)', stageLevel: 8, isSecondaryGate: false }
    ],
    grade10EquivName: 'Attestation de Fin d’Études Collégiales',
    grade12EquivName: 'Baccalauréat',
    vocationalSystemName: 'OFPPT Cités des Métiers et des Compétences',
    primaryLanguage: 'Arabic & French'
  }
];

// ==========================================
// 2. 21 GLOBAL OCCUPATION TAXONOMY CATEGORIES
// ==========================================
export const GLOBAL_CAREER_CATEGORIES: OccupationTaxonomyCategory[] = [
  { id: 'tech_it', name: 'Technology & IT', emoji: '💻', description: 'Software, cloud, cybersecurity, systems & AI architecture' },
  { id: 'data_analytics', name: 'Data & Analytics', emoji: '📊', description: 'Data science, BI, data analytics, ML engineering & statistics' },
  { id: 'finance_banking', name: 'Finance & Banking', emoji: '🏦', description: 'Investment, accounting, fintech, audit & actuarial analysis' },
  { id: 'business_mgmt', name: 'Business & Management', emoji: '📈', description: 'Product management, strategy, operations & entrepreneurship' },
  { id: 'healthcare', name: 'Healthcare & Medicine', emoji: '🏥', description: 'Medicine, nursing, pharmacy, therapies & clinical diagnostics' },
  { id: 'law_legal', name: 'Law & Legal Services', emoji: '⚖️', description: 'Litigation, corporate law, compliance, human rights & IP' },
  { id: 'engineering', name: 'Engineering & Built Environment', emoji: '🏗️', description: 'Mechanical, civil, electrical, robotics & architecture' },
  { id: 'design_creative', name: 'Design & Creative Arts', emoji: '🎨', description: 'UI/UX, visual design, industrial design & animation' },
  { id: 'education_pedagogy', name: 'Education & Academics', emoji: '🎓', description: 'K-12 teaching, higher education, educational psychology & EdTech' },
  { id: 'science_research', name: 'Science & Research', emoji: '🔬', description: 'Biotechnology, chemistry, astrophysics, genomics & materials' },
  { id: 'sales_marketing', name: 'Sales & Marketing', emoji: '🛒', description: 'Growth marketing, brand strategy, enterprise sales & performance' },
  { id: 'agri_environment', name: 'Agriculture & Environment', emoji: '🌱', description: 'Sustainability, agronomy, renewable energy & climate solutions' },
  { id: 'travel_aviation', name: 'Travel & Aviation', emoji: '✈️', description: 'Pilots, aeronautical ops, air traffic & global hospitality' },
  { id: 'automotive', name: 'Automotive & EV Mobility', emoji: '🚗', description: 'Electric vehicles, autonomous driving, powertrain & diagnostics' },
  { id: 'manufacturing', name: 'Manufacturing & Industry 4.0', emoji: '🏭', description: 'Smart manufacturing, industrial automation & precision tools' },
  { id: 'skilled_trades', name: 'Skilled Trades & Infrastructure', emoji: '🔧', description: 'Electricians, precision machining, plumbing, HVAC & carpentry' },
  { id: 'govt_public', name: 'Government & Public Policy', emoji: '🏛️', description: 'Civil service, diplomacy, urban planning & public administration' },
  { id: 'hospitality_food', name: 'Hospitality, Culinary & Tourism', emoji: '🧑‍🍳', description: 'Executive culinary arts, hotel operations & food science' },
  { id: 'media_entertainment', name: 'Media, Journalism & Film', emoji: '🎥', description: 'Digital media, broadcasting, sound engineering & investigative writing' },
  { id: 'intl_dev_ngo', name: 'International Development & NGOs', emoji: '🌍', description: 'Humanitarian aid, global health, sustainability & philanthropy' },
  { id: 'logistics_supply', name: 'Logistics & Supply Chain', emoji: '🚢', description: 'Global freight, procurement, maritime logistics & warehouse automation' }
];

// ==========================================
// 3. COMPREHENSIVE SAMPLE OCCUPATION TAXONOMY
// ==========================================
export const POPULAR_OCCUPATIONS: OccupationItem[] = [
  // Tech & IT
  {
    id: 'software_engineer',
    title: 'Software Engineer / Full Stack Developer',
    category: 'tech_it',
    isRegulated: false,
    briefDescription: 'Architects, writes, tests, and deploys high-performance web, mobile, and backend software systems.',
    defaultSkills: ['TypeScript', 'React', 'Node.js', 'System Design', 'Git', 'Data Structures & Algorithms']
  },
  {
    id: 'cybersecurity_analyst',
    title: 'Cybersecurity Analyst / Information Security Specialist',
    category: 'tech_it',
    isRegulated: false,
    briefDescription: 'Monitors, investigates, and defends IT infrastructure, networks, and applications from malicious threats and vulnerabilities.',
    defaultSkills: ['Network Security', 'Incident Response', 'SIEM Tools', 'Penetration Testing', 'ISO 27001', 'Threat Intelligence']
  },
  {
    id: 'cloud_architect',
    title: 'Cloud Solutions Architect',
    category: 'tech_it',
    isRegulated: false,
    briefDescription: 'Designs resilient, scalable, cost-optimized multi-cloud infrastructures using AWS, GCP, Azure, and Kubernetes.',
    defaultSkills: ['AWS/GCP/Azure', 'Kubernetes', 'Terraform', 'Microservices', 'Disaster Recovery', 'Security Architecture']
  },
  {
    id: 'ai_ml_engineer',
    title: 'AI / Machine Learning Engineer',
    category: 'tech_it',
    isRegulated: false,
    briefDescription: 'Builds, trains, and operationalizes machine learning, LLM, deep learning, and computer vision models.',
    defaultSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLM Fine-tuning', 'MLOps', 'Vector Databases', 'Linear Algebra']
  },

  // Data & Analytics
  {
    id: 'data_analyst',
    title: 'Data Analyst',
    category: 'data_analytics',
    isRegulated: false,
    briefDescription: 'Extracts, transforms, analyzes, and visualizes complex datasets to drive data-informed business decisions.',
    defaultSkills: ['SQL', 'Excel / Spreadsheets', 'Power BI / Tableau', 'Python / R', 'Statistical Inference', 'Business Intelligence']
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist',
    category: 'data_analytics',
    isRegulated: false,
    briefDescription: 'Uses statistical modeling, predictive analytics, and algorithmic experimentation to solve complex business problems.',
    defaultSkills: ['Python', 'SQL', 'Statistical Modeling', 'Machine Learning', 'A/B Testing', 'Data Storytelling']
  },
  {
    id: 'data_engineer',
    title: 'Data Engineer',
    category: 'data_analytics',
    isRegulated: false,
    briefDescription: 'Builds real-time and batch data pipelines, data warehouses, and ETL infrastructure to support enterprise analytics.',
    defaultSkills: ['SQL', 'Python', 'Apache Spark', 'Snowflake / BigQuery', 'dbt', 'Airflow', 'Data Modeling']
  },

  // Finance & Banking
  {
    id: 'chartered_accountant',
    title: 'Chartered Accountant / Certified Public Accountant (CPA)',
    category: 'finance_banking',
    isRegulated: true,
    briefDescription: 'Provides statutory financial audits, taxation guidance, corporate accounting, and financial strategy.',
    defaultSkills: ['IFRS / GAAP Accounting', 'Taxation Law', 'Financial Auditing', 'Corporate Finance', 'Cost Analysis']
  },
  {
    id: 'investment_banker',
    title: 'Investment Banking Analyst / Associate',
    category: 'finance_banking',
    isRegulated: false,
    briefDescription: 'Conducts financial valuation modeling, capital raising advisory, debt structuring, and mergers & acquisitions (M&A).',
    defaultSkills: ['DCF & LBO Financial Modeling', 'M&A Valuation', 'Pitchbooks', 'Capital Markets', 'Due Diligence']
  },
  {
    id: 'financial_risk_analyst',
    title: 'Financial Risk Analyst',
    category: 'finance_banking',
    isRegulated: false,
    briefDescription: 'Evaluates market, credit, operational, and liquidity risks using quantitative statistical modeling.',
    defaultSkills: ['Risk Modeling (VaR)', 'Credit Analysis', 'Basel III Regulations', 'Python / R', 'Stochastic Modeling']
  },

  // Business & Management
  {
    id: 'product_manager',
    title: 'Product Manager',
    category: 'business_mgmt',
    isRegulated: false,
    briefDescription: 'Sets product vision, conducts customer discovery, prioritizes roadmaps, and aligns engineering with business strategy.',
    defaultSkills: ['Product Strategy', 'User Discovery', 'Roadmap Prioritization', 'Agile / Scrum', 'Metrics & Analytics', 'Wireframing']
  },
  {
    id: 'management_consultant',
    title: 'Management / Strategy Consultant',
    category: 'business_mgmt',
    isRegulated: false,
    briefDescription: 'Advises executive leaders on organizational transformation, cost optimization, growth strategies, and operations.',
    defaultSkills: ['Structured Problem Solving', 'Case Analysis', 'Executive Presentations', 'Financial Modeling', 'Change Management']
  },

  // Healthcare
  {
    id: 'medical_doctor',
    title: 'Medical Doctor / Physician (General & Specialist)',
    category: 'healthcare',
    isRegulated: true,
    briefDescription: 'Diagnoses illnesses, prescribes treatments, performs medical procedures, and manages patient care.',
    defaultSkills: ['Clinical Diagnostics', 'Pathology & Pharmacology', 'Patient Communication', 'Emergency Medicine', 'Medical Ethics']
  },
  {
    id: 'registered_nurse',
    title: 'Registered Nurse (RN)',
    category: 'healthcare',
    isRegulated: true,
    briefDescription: 'Delivers acute and chronic patient care, administers medication, coordinates treatment plans, and supports patient recovery.',
    defaultSkills: ['Patient Care', 'Medication Administration', 'Triage Assessment', 'Critical Care Protocols', 'Compassionate Care']
  },
  {
    id: 'pharmacist',
    title: 'Pharmacist',
    category: 'healthcare',
    isRegulated: true,
    briefDescription: 'Dispenses prescription medications, ensures drug safety interactions, and counsels patients on pharmaceutical therapies.',
    defaultSkills: ['Pharmacotherapy', 'Drug Interaction Analysis', 'Compounding', 'Pharmacy Regulations', 'Patient Counseling']
  },
  {
    id: 'clinical_psychologist',
    title: 'Clinical Psychologist / Psychotherapist',
    category: 'healthcare',
    isRegulated: true,
    briefDescription: 'Assesses, diagnoses, and treats mental health disorders, cognitive challenges, and emotional difficulties using therapy.',
    defaultSkills: ['CBT / DBT Therapy', 'Psychological Assessment', 'Diagnostic Criteria (DSM-5 / ICD-11)', 'Empathy & Ethics']
  },

  // Law
  {
    id: 'lawyer_attorney',
    title: 'Lawyer / Attorney / Advocate / Solicitor',
    category: 'law_legal',
    isRegulated: true,
    briefDescription: 'Represents clients in legal proceedings, drafts binding contracts, and advises on statutory compliance and justice.',
    defaultSkills: ['Legal Research', 'Contract Drafting', 'Oral Advocacy', 'Case Law Interpretation', 'Litigation Strategy']
  },

  // Engineering
  {
    id: 'mechanical_engineer',
    title: 'Mechanical Engineer',
    category: 'engineering',
    isRegulated: true,
    briefDescription: 'Designs, develops, tests, and manufactures thermal, mechanical, automotive, and robotics systems.',
    defaultSkills: ['CAD / SolidWorks', 'Thermodynamics', 'Finite Element Analysis (FEA)', 'Fluid Mechanics', 'Prototyping']
  },
  {
    id: 'civil_structural_engineer',
    title: 'Civil & Structural Engineer',
    category: 'engineering',
    isRegulated: true,
    briefDescription: 'Plans, designs, and oversees construction of infrastructure like bridges, high-rises, transportation, and water systems.',
    defaultSkills: ['Structural Analysis', 'AutoCAD / Revit', 'Geotechnical Engineering', 'Building Codes', 'Project Site Supervision']
  },
  {
    id: 'electrical_engineer',
    title: 'Electrical & Electronics Engineer',
    category: 'engineering',
    isRegulated: true,
    briefDescription: 'Designs circuit boards, microelectronics, power distribution grids, renewable energy, and embedded hardware systems.',
    defaultSkills: ['Circuit Design (PCB)', 'Embedded C / C++', 'Power Systems', 'Signal Processing', 'MATLAB / Simulink']
  },

  // Design & Creative
  {
    id: 'ui_ux_designer',
    title: 'UI/UX Product Designer',
    category: 'design_creative',
    isRegulated: false,
    briefDescription: 'Conducts user research, creates wireframes, interactive prototypes, design systems, and delightful digital experiences.',
    defaultSkills: ['Figma', 'User Research', 'Design Systems', 'Information Architecture', 'Usability Testing', 'Interaction Design']
  },
  {
    id: 'graphic_visual_designer',
    title: 'Graphic & Brand Identity Designer',
    category: 'design_creative',
    isRegulated: false,
    briefDescription: 'Creates brand identities, logos, marketing visuals, typography guidelines, and packaging concepts.',
    defaultSkills: ['Adobe Illustrator / Photoshop', 'Typography', 'Color Theory', 'Brand Strategy', 'Print & Digital Layout']
  },

  // Education
  {
    id: 'secondary_school_teacher',
    title: 'Secondary School Teacher (STEM / Humanities)',
    category: 'education_pedagogy',
    isRegulated: true,
    briefDescription: 'Educates adolescents, designs engaging lesson curricula, assesses learning outcomes, and fosters cognitive development.',
    defaultSkills: ['Pedagogy & Lesson Planning', 'Classroom Management', 'Formative Assessment', 'Subject Mastery', 'Student Mentoring']
  },

  // Skilled Trades
  {
    id: 'electrician',
    title: 'Licensed Electrician / Electrical Contractor',
    category: 'skilled_trades',
    isRegulated: true,
    briefDescription: 'Installs, maintains, and repairs electrical wiring, control panels, circuit breakers, and renewable solar installations.',
    defaultSkills: ['Electrical Schematics', 'National Electrical Code (NEC / IET)', 'Troubleshooting', 'Conduit Bending', 'Safety Protocols']
  },
  {
    id: 'hvac_technician',
    title: 'HVAC-R Technician (Heating, Ventilation & AC)',
    category: 'skilled_trades',
    isRegulated: true,
    briefDescription: 'Installs, maintains, and diagnoses residential and commercial heating, cooling, refrigeration, and airflow systems.',
    defaultSkills: ['Refrigeration Cycles', 'Electrical Troubleshooting', 'EPA 608 Certification', 'Piping & Brazing', 'Thermostats']
  },

  // Aviation
  {
    id: 'commercial_airline_pilot',
    title: 'Commercial Airline Pilot (ATPL / CPL)',
    category: 'travel_aviation',
    isRegulated: true,
    briefDescription: 'Operates multi-engine passenger and cargo aircraft, conducts pre-flight safety calculations, and navigates flight paths.',
    defaultSkills: ['Instrument Flight Rules (IFR)', 'Multi-Engine Aerodynamics', 'Crew Resource Management', 'Aviation Meteorology', 'Radio Comms']
  },

  // Sales & Marketing
  {
    id: 'digital_growth_marketer',
    title: 'Digital Marketing & Growth Strategist',
    category: 'sales_marketing',
    isRegulated: false,
    briefDescription: 'Plans and runs search engine marketing, SEO, paid media campaigns, funnel optimization, and conversion analytics.',
    defaultSkills: ['SEO / SEM', 'Google Analytics 4', 'Paid Ads (Meta / Google)', 'Content Strategy', 'Conversion Rate Optimization', 'Copywriting']
  }
];

// Helper to get countries by region
export function getCountriesByRegion(region: string): CountryData[] {
  return GLOBAL_COUNTRIES.filter((c) => c.region === region);
}

// Helper to find country by code
export function getCountryByCode(code: string): CountryData | undefined {
  return GLOBAL_COUNTRIES.find((c) => c.countryCode.toUpperCase() === code.toUpperCase());
}

// Helper to get occupations by category
export function getOccupationsByCategory(categoryId: string): OccupationItem[] {
  return POPULAR_OCCUPATIONS.filter((o) => o.category === categoryId);
}
