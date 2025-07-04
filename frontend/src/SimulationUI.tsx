import { useEffect, useState } from 'react';

type Input = { term: string; value: number };
type Status = { term: string; team: string; approved: boolean };


export default function SimulationUI() {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [valuation, setValuation] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [team, setTeam] = useState<'team1' | 'team2'>('team1');
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [videoVisible, setVideoVisible] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [animateVideoOut, setAnimateVideoOut] = useState(false);
  const closeVideoModal = () => {
    setAnimateVideoOut(true);
    setVideoVisible(false);
    setTimeout(() => {
      setShowVideoModal(false);
      setAnimateVideoOut(false);
    }, 150);
  };
  const openVideoModal = () => {
    setShowVideoModal(true);
    setTimeout(() => {
      setVideoVisible(true);
    }, 10);
  };
  // Text Modal
  const [showTextModal, setShowTextModal] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [animateTextOut, setAnimateTextOut] = useState(false);


  // Guide Modal
  const [showGuidance, setShowGuidance] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const [animateGuideOut, setAnimateGuideOut] = useState(false);
  const openTextModal = () => {
    setShowTextModal(true);
    setTimeout(() => setTextVisible(true), 10);
  };

  const openGuideModal = () => {
    setShowGuidance(true);
    setTimeout(() => setGuideVisible(true), 10);
  };
  const closeTextModal = () => {
    setAnimateTextOut(true);
    setTextVisible(false);
    setTimeout(() => {
      setShowTextModal(false);
      setAnimateTextOut(false);
    }, 300);
  };

  const closeGuideModal = () => {
    setAnimateGuideOut(true);
    setGuideVisible(false);
    setTimeout(() => {
      setShowGuidance(false);
      setAnimateGuideOut(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    const res = await fetch('http://localhost:5000/api/state');
    const data = await res.json();
    setInputs(data.inputs);
    setStatuses(data.status);
    setValuation(data.valuation);
    setAgreed(data.agreed);
    setLocalValues(
      Object.fromEntries(data.inputs.map((i: Input) => [i.term, i.value]))
    );
      console.log('Current team:', team);
console.log('Statuses:', statuses);

  };

  const handleValueChange = (term: string, value: number) => {
    setLocalValues((prev) => ({ ...prev, [term]: value }));
  };

  const updateInput = async (term: string) => {
    const value = localValues[term];
    await fetch('http://localhost:5000/api/update_input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, value }),
    });
    fetchState();
  };

  const toggleStatus = async (term: string) => {
    await fetch('http://localhost:5000/api/toggle_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, team }),
    });
    fetchState();
  };

return (

  <div className="flex  font-sans">

    {/* Sidebar */}
    <div className="w-52 p-4 bg-gray-700 text-white min-h-screen">
      <h3 className="font-bold mb-4 text-lg">Menu</h3>
      <button
          onClick={openVideoModal}
          className="block w-full mb-2 bg-gray-500  hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        🎬 Video
      </button>
      <button
          onClick={openTextModal}
           className="block w-full mb-2 bg-gray-500  hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        📝 Text
      </button>
      <button
          onClick={openGuideModal}
           className="block w-full mb-2 bg-gray-500  hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        📘 Guide
      </button>

    </div>

    {/* Main content */}
    <div className="flex-1 bg-gray-800 p-6 text-white space-y-6">

      {/* Header */}
      <div className="bg-gray-700 rounded p-4 shadow flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finsimco Simulation</h1>
        <div className="flex items-center gap-2 bg-white text-gray-800 px-4 py-1 rounded shadow text-sm font-medium">
          ⏱ {secondsElapsed} sec.
        </div>
      </div>

      {/* Team Switch */}
      <div className="bg-gray-700 rounded p-4 shadow flex items-center gap-4">
        <strong>Current team:</strong>
        <button
          onClick={() => setTeam("team1")}
          className={`px-3 py-1 rounded cursor-pointer ${
            team === "team1" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Team 1
        </button>
        <button
          onClick={() => setTeam("team2")}
          className={`px-3 py-1 rounded cursor-pointer ${
            team === "team2" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Team 2
        </button>
      </div>

      {/* Valuation */}
      <div className="bg-gray-700 rounded p-4 shadow space-y-2">
        <h2 className="text-xl font-bold">
          💰 Business Valuation: <span className="text-yellow-300">{valuation ?? "—"}</span>
        </h2>
        <p>
          🔒 Agreement reached:
          {agreed ? (
            <span className="text-green-400 ml-2">✅ Yes</span>
          ) : (
            <span className="text-red-400 ml-2">❌ No</span>
          )}
        </p>
      </div>

      {/* Parameters */}
      <div className="bg-gray-700 rounded p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">📝 Parameters:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputs.map((item) => (
            <div key={item.term} className="flex items-center gap-2">
              <strong className="w-28">{item.term}:</strong>
              {team === "team1" ? (
                <>
                  <input
                      type="number"
                      value={localValues[item.term] ?? item.value}
                      onChange={(e) =>
                          handleValueChange(item.term, Number(e.target.value))
                      }
                      className="bg-transparent border border-white text-white px-2 py-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                      onClick={() => updateInput(item.term)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    Save
                  </button>
                </>
              ) : (
                  <span>{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmations */}
      {team === "team2" && (
        <div className="bg-gray-700 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-3">✅ Confirmation:</h3>
          <div className="space-y-2">
            {statuses
              .filter((s) => s.team === team)
              .map((s) => (
                <div key={s.term} className="flex items-center gap-4">
                  <span>
                    {s.term}:
                    {s.approved ? (
                      <span className="ml-2 text-green-400">✅ OK</span>
                    ) : (
                      <span className="ml-2 text-red-400">❌ TBD</span>
                    )}
                  </span>
                  <button
                    onClick={() => toggleStatus(s.term)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded cursor-pointer"
                  >
                    Toggle
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Refresh */}
      <div>
        <button
          onClick={fetchState}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded cursor-pointer"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>

    {/* Video Modal */}
{showVideoModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div
        className={`bg-white rounded-lg p-6 w-full max-w-xl shadow-lg transform transition-all duration-300
    ${videoVisible && !animateVideoOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >

      <h2 className="text-xl font-bold mb-2">🎬 Video</h2>
      <p className="mb-4 text-gray-700">
        This is a placeholder for an embedded video.
      </p>
      <button
          onClick={closeVideoModal}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Close
      </button>
    </div>
  </div>
)}


    {/* Text Modal */}
  {showTextModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      className={`bg-white rounded-lg p-6 w-full max-w-xl shadow-lg transform transition-all duration-300
        ${textVisible && !animateTextOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <h2 className="text-xl font-bold mb-2">📝 Text (500 characters)</h2>
      <p className="mb-4 text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
        odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
        quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
        mauris. Fusce nec tellus sed augue semper porta.
      </p>
      <button
        onClick={closeTextModal}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Close
      </button>
    </div>
  </div>
)}

          {/* Guidance Modal */}
          {showGuidance && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      className={`bg-white rounded-lg p-6 w-full max-w-xl shadow-lg transform transition-all duration-300
        ${guideVisible && !animateGuideOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <h2 className="text-xl font-bold mb-2">📘 Simulation Guide</h2>
      <p className="mb-4 text-gray-700">
        In this simulation, <strong>Team 1</strong> inputs values for each
        parameter. <strong>Team 2</strong> approves them (OK / TBD).<br /><br />
        Once all parameters are confirmed, agreement is considered reached.
        <br /><br />
        You can switch between teams and interact with data accordingly.
      </p>
      <button
        onClick={closeGuideModal}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Close
      </button>
    </div>
  </div>
)}
        </div>
    );


    }

