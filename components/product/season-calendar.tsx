import type { SeasonRow } from "@/lib/types";
import { monthLabels } from "@/lib/utils";

/**
 * Twelve-month availability grid. The filled cell is the information, so the month
 * label is also written into each cell's accessible name — a screen reader user gets
 * "Alphonso Mango, March, available" rather than a wall of blank cells.
 */
export function SeasonCalendar({ rows, caption }: { rows: SeasonRow[]; caption: string }) {
  const months = monthLabels();

  // contain-paint as well as overflow-x-auto: without it the table's full width still
  // counts towards the document scroll area and the whole page scrolls sideways.
  return (
    <div className="contain-paint overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse">
        <caption className="mono-label mb-4 text-left">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="mono-label pb-3 text-left font-normal">
              Product
            </th>
            {months.map((month) => (
              <th
                key={month}
                scope="col"
                className="pb-3 text-center font-mono text-[0.6875rem] font-normal tracking-[0.08em] text-slate-soft uppercase"
              >
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item} className="border-t border-brass/25">
              <th
                scope="row"
                className="py-3 pr-4 text-left text-[0.9375rem] font-normal text-harbour"
              >
                {row.item}
              </th>
              {row.months.map((available, index) => (
                <td key={months[index]} className="px-1 py-3 text-center">
                  <span
                    aria-hidden="true"
                    className={`block h-6 rounded-[2px] ${
                      available ? "bg-brass/75" : "bg-harbour/8"
                    }`}
                  />
                  <span className="sr-only">
                    {months[index]}: {available ? "available" : "not available"}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
