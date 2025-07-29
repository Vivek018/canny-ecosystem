const categoryList = [
  {
    title: "Employee",
    description:
      "Access comprehensive employee records, including detailed work history, project allocations, site-wise distributions, and location-specific staff listings.",
  },
  {
    title: "Payment",
    description:
      "Dive into payroll details across sites — including salaries, advances, reimbursements, exit settlements, statutory breakdowns (PF, ESIC, etc.), and invoice statuses.",
  },
  {
    title: "Attendance",
    description:
      "Review attendance trends such as monthly presence, top absentees, most consistent employees, and site reliability rankings.",
  },
  {
    title: "Reports",
    description:
      "Generate summaries of statutory contributions (PF, ESIC, PT, LWF, Bonus), along with eligibility and calculated amounts for Gratuity, Leave Encashment, and other benefits.",
  },
  {
    title: "Events",
    description:
      "Explore internal incidents such as complaints, disciplinary issues (e.g., unapproved leaves, misconduct), accidents, and formal HR cases.",
  },
];

export default function ChatCategoryIndex() {
  return (
    <div className="w-full flex-1 flex overflow-scroll">
      <div className="flex flex-col items-start justify-center gap-4 text-muted-foreground tracking-wide text-[15px] w-full p-4 sm:px-10 md:px-20 lg:px-60 overflow-scroll m-auto">
        <h3 className="text-xl font-semibold">
          Please select a category to begin:
        </h3>
        <p className="-mt-4 text-sm text-muted-foreground">
          All categories support future forecasting based on current
          organizational data and trends.
        </p>
        {categoryList.map((cat) => (
          <div key={cat.title}>
            <p className="font-medium text-base">{cat.title}</p>
            <p className="pl-4 text-sm">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
