'use client';
import { CvEntity } from "@/lib/types/azure-tables";
import { useEffect, useState } from "react";

export default function CVsuggest({ userId, jobId }: { userId: string, jobId: string }) {
  const [suggest, setSuggestions] = useState(false);
  const [cvs, setCvs]             = useState<CvEntity[]>([]);
  const [selectedCv0, setSelectedCv0] = useState<string>("");
  const [selectedCv1, setSelectedCv1] = useState<string>("");
  const [selectedCv2, setSelectedCv2] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const cvsRes = await fetch("/api/cv/list");
        const cvsData = await cvsRes.json();
        setCvs(cvsData);
      } catch (error) {
        console.error("Failed to fetch CVs:", error);
      }
    }
    load();
  }, []);

  async function handleSuggestion() {
    try {
      const response = await fetch("/api/cv/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          jobId,
          cvIds: [selectedCv0, selectedCv1, selectedCv2].filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      console.log("cvids", [selectedCv0, selectedCv1, selectedCv2].filter(Boolean));
      const result = await response.json();
      console.log("Suggestion result:", result);
    } catch (error) {
      console.error("Error in suggestion AI:", error);
    }
  }

  return (
    <div>
      {suggest ? (
        <div>
          
          <select value={selectedCv0} onChange={(e) => setSelectedCv0(e.target.value)}>
            <option value="">No CV selected</option>
            {cvs.map((cv) => (
              <option key={cv.rowKey} value={cv.rowKey}>{cv.fileName}</option>
            ))}
          </select>

          
          <select value={selectedCv1} onChange={(e) => setSelectedCv1(e.target.value)}>
            <option value="">No CV selected</option>
            {cvs.map((cv) => (
              <option key={cv.rowKey} value={cv.rowKey}>{cv.fileName}</option>
            ))}
          </select>

          <select value={selectedCv2} onChange={(e) => setSelectedCv2(e.target.value)}>
            <option value="">No CV selected</option>
            {cvs.map((cv) => (
              <option key={cv.rowKey} value={cv.rowKey}>{cv.fileName}</option>
            ))}
          </select>

          <button onClick={handleSuggestion}>Suggest</button>
        </div>
      ) : (
        <button
          className="text-sm px-4 py-2 border text-white border-gray-200 bg-[#052e02] rounded-lg"
          onClick={() => setSuggestions(true)}
        >
          Suggest CV
        </button>
      )}
    </div>
  );
}