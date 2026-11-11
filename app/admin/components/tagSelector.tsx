// "use client";

// import { useEffect, useMemo, useState } from "react";

// type TagItem = { rowKey: string; tag: string };

// export default function TagSelector(props: {
//   tenantId: string;
//   value: string[];                 // selected tags
//   onChange: (next: string[]) => void;
//   disabled?: boolean;
//   label?: string;
// }) {
//   const { tenantId, value, onChange, disabled, label = "Tags" } = props;

//   const [allTags, setAllTags] = useState<TagItem[]>([]);
//   const [tagQuery, setTagQuery] = useState("");
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     let ignore = false;

//     async function loadTags() {
//       try {
//         const res = await fetch(
//           `/api/tags?tenantId=${encodeURIComponent(tenantId)}`,
//           { headers: { accept: "application/json" } }
//         );
//         if (!res.ok) throw new Error(`Failed to load tags (${res.status})`);

//         const data = (await res.json()) as unknown;
//         if (!ignore) setAllTags(Array.isArray(data) ? (data as TagItem[]) : []);
//       } catch (e) {
//         console.error("Tag load error:", e);
//       }
//     }

//     loadTags();
//     return () => {
//       ignore = true;
//     };
//   }, [tenantId]);

//   const suggestions = useMemo(() => {
//     const q = tagQuery.trim().toLowerCase();
//     if (!q) return [];

//     return allTags
//       .map((t) => t.tag)
//       .filter((t) => t.toLowerCase().includes(q))
//       .filter((t) => !value.includes(t))
//       .slice(0, 8);
//   }, [allTags, tagQuery, value]);

//   function addTag(raw: string) {
//     const tag = raw.trim().toLowerCase();
//     if (!tag) return;
//     if (value.includes(tag)) return;

//     onChange([...value, tag]);
//     setTagQuery("");
//     setShowMenu(false);
//   }

//   function removeTag(tag: string) {
//     onChange(value.filter((t) => t !== tag));
//   }

//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

//       <div className="flex flex-wrap gap-2 mb-2">
//         {value.map((tag) => (
//           <span
//             key={tag}
//             className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
//           >
//             {tag}
//             <button
//               type="button"
//               onClick={() => removeTag(tag)}
//               className="text-blue-900 hover:text-red-600"
//               disabled={disabled}
//             >
//               x
//             </button>
//           </span>
//         ))}
//       </div>

//       <div className="relative">
//         <input
//           type="text"
//           value={tagQuery}
//           onChange={(e) => {
//             setTagQuery(e.target.value);
//             setShowMenu(true);
//           }}
//           onFocus={() => setShowMenu(true)}
//           onBlur={() => setTimeout(() => setShowMenu(false), 120)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               if (suggestions.length > 0) addTag(suggestions[0]);
//               else addTag(tagQuery); // custom tag
//             }
//           }}
//           placeholder="Type 1-2 letters to search, Enter to add"
//           className="w-full p-2 border rounded"
//           disabled={disabled}
//         />

//         {showMenu && suggestions.length > 0 && (
//           <ul className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-auto">
//             {suggestions.map((tag) => (
//               <li key={tag}>
//                 <button
//                   type="button"
//                   onClick={() => addTag(tag)}
//                   className="w-full text-left px-3 py-2 hover:bg-gray-100"
//                   disabled={disabled}
//                 >
//                   {tag}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <p className="mt-1 text-xs text-gray-500">
//         Click a suggestion or press Enter to add a custom tag.
//       </p>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";

type TagItem = { rowKey: string; tag: string };

export default function TagSelector(props: {
  tenantId: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  label?: string;
}) {
  const { tenantId, value, onChange, disabled, label = "Tags" } = props;

  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadTags() {
      try {
        const res = await fetch(
          `/api/tags?tenantId=${encodeURIComponent(tenantId)}`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Failed to load tags (${res.status})`);

        const data = (await res.json()) as unknown;
        if (!ignore) setAllTags(Array.isArray(data) ? (data as TagItem[]) : []);
      } catch (e) {
        console.error("Tag load error:", e);
      }
    }

    loadTags();
    return () => {
      ignore = true;
    };
  }, [tenantId]);

  const suggestions = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return [];

    return allTags
      .map((t) => t.tag)
      .filter((t) => t.toLowerCase().includes(q))
      .filter((t) => !value.includes(t))
      .slice(0, 8);
  }, [allTags, tagQuery, value]);

  function addToSelected(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  async function handleAddTagToDbAndJob() {
    const tag = tagQuery.trim().toLowerCase();
    if (!tag) return;

    // Already selected
    if (value.includes(tag)) {
      setTagQuery("");
      setShowMenu(false);
      return;
    }

    setIsAdding(true);
    try {
      // If exists -> service should increment and return existing/updated
      // If not exists -> create with rowKey = tag
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId, tag }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add tag (${res.status}): ${text}`);
      }

      const created = (await res.json()) as TagItem;

      // ensure local list has it for future suggestion
      setAllTags((prev) =>
        prev.some((t) => t.tag === created.tag)
          ? prev
          : [...prev, { rowKey: created.rowKey ?? created.tag, tag: created.tag }]
      );

      addToSelected(tag);
      setTagQuery("");
      setShowMenu(false);
    } catch (e) {
      console.error("Add tag failed:", e);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-900 hover:text-red-600"
              disabled={disabled || isAdding}
            >
              x
            </button>
          </span>
        ))}
      </div>

      <div className="relative flex gap-2">
        <input
          type="text"
          value={tagQuery}
          onChange={(e) => {
            setTagQuery(e.target.value);
            setShowMenu(true);
          }}
          onFocus={() => setShowMenu(true)}
          onBlur={() => setTimeout(() => setShowMenu(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions.length > 0) addToSelected(suggestions[0]);
              else void handleAddTagToDbAndJob();
            }
          }}
          placeholder="Type tag..."
          className="w-full p-2 border rounded"
          disabled={disabled || isAdding}
        />

        <button
          type="button"
          onClick={handleAddTagToDbAndJob}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={disabled || isAdding || !tagQuery.trim()}
        >
          {isAdding ? "Adding..." : "Add Tag"}
        </button>

        {showMenu && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-11 w-[calc(100%-110px)] bg-white border rounded shadow max-h-48 overflow-auto">
            {suggestions.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => addToSelected(tag)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  disabled={disabled || isAdding}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}