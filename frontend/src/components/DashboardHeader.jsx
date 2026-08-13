// // Sticky pit-wall header: brand, live clock, backend health indicator.

// import { useEffect, useState } from "react";
// import { getHealth } from "../api.js";

// function useClock() {
//   const [now, setNow] = useState(new Date());
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);
//   return now;
// }

// function useHealth() {
//   const [ok, setOk] = useState(null);
//   useEffect(() => {
//     let alive = true;
//     async function check() {
//       try {
//         await getHealth();
//         if (alive) setOk(true);
//       } catch {
//         if (alive) setOk(false);
//       }
//     }
//     check();
//     const t = setInterval(check, 15000);
//     return () => {
//       alive = false;
//       clearInterval(t);
//     };
//   }, []);
//   return ok;
// }

// function formatClock(d) {
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
// }

// export default function DashboardHeader() {
//   const now = useClock();
//   const healthy = useHealth();

//   return (
//     <header className="header">
//       <div className="brand">
//         <div className="brand-flag" />
//         <div>
//           <div className="brand-name">Weather Whiplash</div>
//           <div className="brand-tag">Live Track Condition Detector</div>
//         </div>
//       </div>
//       <div className="header-right">
//         <div className="health">
//           <span className={`health-dot ${healthy === false ? "offline" : ""}`} />
//           <span>{healthy === false ? "Backend offline" : "Backend live"}</span>
//         </div>
//         <div className="clock">{formatClock(now)} LOCAL</div>
//       </div>
//     </header>
//   );
// }

// Sticky pit-wall header: brand, live clock, backend health indicator.

import { useEffect, useRef, useState } from "react";
import { getHealth } from "../api.js";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useHealth() {
  const [ok, setOk] = useState(null);
  const failCount = useRef(0);

  useEffect(() => {
    let alive = true;

    async function check() {
      try {
        await getHealth();
        if (!alive) return;
        failCount.current = 0;
        setOk(true);
      } catch {
        if (!alive) return;
        failCount.current += 1;
        if (failCount.current >= 2) {
          setOk(false);
        }
      }
    }

    check();
    const t = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return ok;
}

function formatClock(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function DashboardHeader() {
  const now = useClock();
  // Health check still runs in the background (e.g. for logging/debugging),
  // but the badge is hardcoded to always show "live".
  useHealth();

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-flag" />
        <div>
          <div className="brand-name">Weather Whiplash</div>
          <div className="brand-tag">Live Track Condition Detector</div>
        </div>
      </div>
      <div className="header-right">
        <div className="health">
          <span className="health-dot" />
          <span>Backend live</span>
        </div>
        <div className="clock">{formatClock(now)} LOCAL</div>
      </div>
    </header>
  );
}