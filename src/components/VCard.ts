// KIND VALUES
export type kindValue = 'individual' | 'group' | 'org'

// Common TYPE parameter values shared across multiple properties (EMAIL, TEL, ADR, etc.) - RFC 6350 §5.6
export type commonTypeValue = 'work' | 'home'

// TEL-specific TYPE values - RFC 6350 §6.4.1
export type telSpecificTypeValue =
  | 'text' // Indicates that the telephone number supports text messages (SMS).
  | 'voice' // Indicates a voice telephone number.
  | 'fax' // Indicates a facsimile telephone number.
  | 'cell' // Indicates a cellular or mobile telephone number.
  | 'video' // Indicates a video conferencing telephone number.
  | 'pager' // Indicates a paging device telephone number.
  | 'textphone' // Indicates a telecommunication device for people with hearing or speech difficulties.

export type telTypeValue = commonTypeValue | telSpecificTypeValue
export type telType = telTypeValue | telTypeValue[]

// EMAIL TYPE values - RFC 6350 §6.4.2
export type emailTypeValue = commonTypeValue | 'individual'
export type emailType = emailTypeValue | emailTypeValue[]

// ADR TYPE
export type adrType = {
  type: commonTypeValue
  street: string
  city: string
  region: string
  postCode: string
  country: string
}

export type genderType =
  | 'M' // "male"
  | 'F' // "female"
  | 'O' // "other"
  | 'N' // "none or not applicable"
  | 'U' // "unknown"
