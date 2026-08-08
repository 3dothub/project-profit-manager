export type AttendanceStatus = "Present" | "Half Day" | "Absent";

export interface IAttendance {
  _id: string;
  projectId: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  status: AttendanceStatus;
  salary: number;
  createdAt: string;
}
