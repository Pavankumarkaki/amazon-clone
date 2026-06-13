interface SpecTableProps {
  specs: Record<string, string>;
}

export function SpecTable({ specs }: SpecTableProps) {
  const entries = Object.entries(specs);

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr
              key={key}
              className={i % 2 === 0 ? "bg-[#F0F2F2]" : "bg-white"}
            >
              <th className="w-1/3 px-4 py-2.5 text-left font-normal text-[var(--color-text-primary)]">
                {key}
              </th>
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
