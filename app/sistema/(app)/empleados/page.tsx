import type { Metadata } from "next";
import { EmployeesView } from "../../_components/employees-view";

export const metadata: Metadata = { title: "Empleados" };

export default function Page() {
  return <EmployeesView />;
}
