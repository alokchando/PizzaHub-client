import { MenuItem } from "../../admin/manage-menu-items/page"

type Props = {
  items: MenuItem[]
}

export default function MenuStats({ items }: Props) {
  const stats = [
    {
      title: "Total Items",
      value: items.length,
    },
    {
      title: "Pending",
      value: items.filter((item) => item.status === "pending").length,
    },
    {
      title: "Approved",
      value: items.filter((item) => item.status === "approved").length,
    },
    {
      title: "Rejected",
      value: items.filter((item) => item.status === "rejected").length,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.title} className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">{stat.title}</p>

          <h2 className="mt-2 text-2xl font-bold">{stat.value}</h2>
        </div>
      ))}
    </div>
  )
}
