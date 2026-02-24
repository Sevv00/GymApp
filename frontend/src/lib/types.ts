export interface MoneyTransfer {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  FromBankAccountID: number
  ToBankAccountID: number
  FundraiserID: number
  KidID: number | null
  Description: string | null
  Amount: number
  PayerName?: string | null
  PayeeName?: string | null
  KidName?: string | null
  FundraiserTitle?: string | null
  IsWithdrawal?: boolean
}

export interface OperationLog {
  ID: number
  CreatedAt: string
  Message: string
}

export interface ClassReport {
  class: {
    id: number
    name: string
    created_at: string
    treasurer_name: string
    total_fundraisers: number
    open_fundraisers: number
    canceled_fundraisers: number
  }
  transfers: MoneyTransfer[]
  logs: OperationLog[]
}

export interface FundraiserReport {
  fundraiser: {
    id: number
    title: string
    description: string
    start_date: string
    due_date: string
    per_kid_payment_amount: number
    class_room_id: number
    is_blocked: boolean
    canceled_at?: string | null
    canceled_by_name?: string | null
  }
  transfers: MoneyTransfer[]
  logs: OperationLog[]
}

export interface KidReport {
  kid: {
    id: number
    name: string
    parent_name: string
  }
  fundraisers: Array<{
    fundraiser_id: number
    fundraiser_title: string
    transfers: MoneyTransfer[]
  }>
  logs: OperationLog[]
}

export interface File {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  Name: string
  Data: number[] // byte array
  FundraiserID: number
}

export interface BankAccount {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  FundraiserID: number | null
  UserID: number | null
  IBAN: string
  Balance: number
  FromBankAccountTransfers: MoneyTransfer[] | null
  ToBankAccountTransfers: MoneyTransfer[] | null
}

export interface Kid {
  ID: number
  FirstName: string
  LastName: string
  Icon: number[] | string | null
  ParentID: number
  Birthday: string | null
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  ClassRooms: Classroom[] | null
  MoneyTransfers: MoneyTransfer[] | null
}

export interface Fundraiser {
  id: number
  created_at: string
  updated_at: string
  title: string
  description: string
  start_date: string
  due_date: string
  icon: number[] | string | null // byte array or base64 string
  per_kid_payment_amount: number
  class_room_id: number
  is_blocked: boolean
  bank_account: BankAccount
  files: File[] | null
  money_transfers: MoneyTransfer[] | null
  kids?: FundraiserKid[] | null
}

export interface FundraiserKid {
  id: number
  first_name: string
  last_name: string
  icon: number[] | string | null
  paid: boolean
  paid_at: string | null
  paid_by: {
    id: number
    first_name: string
    last_name: string
  } | null
}

export interface Classroom {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  Name: string
  InviteCode?: string | null
  TreasurerID: number
  Fundraisers: Fundraiser[] | null
  Kids: Kid[] | null
  Parents: User[] | null
}

export interface User {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  FirstName: string
  LastName: string
  Email: string
  HashedPassword: string
  Role: string
  IsBlocked: boolean
  BankAccount: BankAccount
  Kids: Kid[]
  ClassRooms: Classroom[]
  ClassRoomsWhereTreasurer: Classroom[]
}
