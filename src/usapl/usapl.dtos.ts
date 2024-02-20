export type EquipmentLevelOptions = 'equipped' | 'raw' | 'raw_with_wraps';
export type RecordLevelOptions =
  | 'state'
  | 'american'
  | 'world'
  | 'national'
  | 'non-us_state';
export type SexOptions = 'm' | 'f' | 'mx';
export type DisciplineOptions = 'squat' | 'benchpress' | 'deadlift' | 'total';
export type OrderByOptions =
  | 'weight'
  | 'points_ipf_gl'
  | 'points_ipf'
  | 'points_dots'
  | 'points_wilks';

export type WeightClassOptions =
  | '-30'
  | '-35'
  | '-40'
  | '-44'
  | '-48'
  | '-52'
  | '-56'
  | '-60'
  | '-67.5'
  | '-82.5'
  | '-90'
  | '-100'
  | '100+'
  | '-75'
  | '-110'
  | '-125'
  | '-140'
  | '140+';

export enum USStates {
  'AL' = 'AL',
  'AK' = 'AK',
  'AS' = 'AS',
  'AZ' = 'AZ',
  'AR' = 'AR',
  'CA' = 'CA',
  'CO' = 'CO',
  'CT' = 'CT',
  'DE' = 'DE',
  'DC' = 'DC',
  'FM' = 'FM',
  'FL' = 'FL',
  'GA' = 'GA',
  'GU' = 'GU',
  'HI' = 'HI',
  'ID' = 'ID',
  'IL' = 'IL',
  'IN' = 'IN',
  'IA' = 'IA',
  'KS' = 'KS',
  'KY' = 'KY',
  'LA' = 'LA',
  'ME' = 'ME',
  'MH' = 'MH',
  'MD' = 'MD',
  'MA' = 'MA',
  'MI' = 'MI',
  'MN' = 'MN',
  'MS' = 'MS',
  'MO' = 'MO',
  'MT' = 'MT',
  'NE' = 'NE',
  'NV' = 'NV',
  'NH' = 'NH',
  'NJ' = 'NJ',
  'NM' = 'NM',
  'NY' = 'NY',
  'NC' = 'NC',
  'ND' = 'ND',
  'MP' = 'MP',
  'OH' = 'OH',
  'OK' = 'OK',
  'OR' = 'OR',
  'PW' = 'PW',
  'PA' = 'PA',
  'PR' = 'PR',
  'RI' = 'RI',
  'SC' = 'SC',
  'SD' = 'SD',
  'TN' = 'TN',
  'TX' = 'TX',
  'UT' = 'UT',
  'VT' = 'VT',
  'VI' = 'VI',
  'VA' = 'VA',
  'WA' = 'WA',
  'WV' = 'WV',
  'WI' = 'WI',
  'WY' = 'WY',
}

export enum DivisionOptions {
  'Junior' = 'JR',
  'Master' = 'M',
  'Teen' = 'T',
  'TeenRaw' = 'TR',
  'Open' = 'O',
  'Master2' = 'M2',
  'Master3' = 'M3',
  'Master1' = 'M1',
  'HighSchoolJV' = 'JV',
  'HighSchoolVarsity' = 'V',
  'Teen1' = 'T1',
  'Teen2' = 'T2',
  'Teen3' = 'T3',
  'Master1a' = 'M1a',
  'Master1b' = 'M1b',
  'Master2a' = 'M2a',
  'Master2b' = 'M2b',
  'Master3a' = 'M3a',
  'Master3b' = 'M3b',
  'Master4a' = 'M4a',
  'Master4b' = 'M4b',
  'Master5a' = 'M5a',
  'Master5b' = 'M5b',
  'Master6' = 'M6',
  'Youth3' = 'Y3',
  'MilitaryOpen' = 'MO',
  'LifetimeDrugFreePoliceAndFireOpen' = 'Lifetime Drug Free Police & Fire Open',
  'Youth1' = 'Y1',
  'Youth2' = 'Y2',
  'Master4' = 'M4',
  'Master6a' = 'M6a',
  'HighSchool' = 'HS',
  'SpecialOlympian' = 'SO',
  'Collegiate' = 'C',
  'Youth' = 'Y',
  'Master5' = 'M5',
  'Lifetime' = '',
  'PoliceAndFire' = 'PF',
  'PoliceAndFireOpen' = 'Police & Fire Open',
  'Guest' = 'G',
  'SubJunior' = 'SJ',
  'AdaptiveAthlete' = 'AA',
  'EquippedOpenPro' = 'PRO',
}
