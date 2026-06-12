interface SpecTableProps {
  specs: Record<string, string>;
}

export function SpecTable({ specs }: SpecTableProps) {
  const entries = Object.entries(specs);
  if (!entries.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="px-4 py-2 font-medium text-gray-700">{key}</td>
              <td className="px-4 py-2 text-gray-600">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
