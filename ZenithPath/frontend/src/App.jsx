import React, { useEffect, useMemo, useRef, useState } from "react";

// ZenithPath — 50% MVP (now with Chatbot + a few extras)
// Core: Navbar, Home (streak + sparkline), Breathe timer, Community, Friends, Profile
// New in this file (still within ~50% scope):
//   • Chatbot (local, rule-based) + floating FAB
//   • Leaderboard (mock from localStorage/friends)
//   • Reminder demo (Notification permission + sample notify)
//   • Breathe: simple selector (only Box 4-4-4-4 option for now)
// Tech: React + TailwindCSS; persistence via localStorage

/******************** helpers ********************/ 
const readLS = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const writeLS = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const cls = (...arr) => arr.filter(Boolean).join(" ");

/******************** root app ********************/ 
export default function App(){
  const [tab, setTab] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Nav tab={tab} setTab={setTab} />
      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6">
        {tab==="home" && <Home />}
        {tab==="breathe" && <Breathe />}
        {tab==="community" && <Community />}
        {tab==="friends" && <Friends />}
        {tab==="leaderboard" && <Leaderboard />}
        {tab==="profile" && <Profile />}
        {tab==="chatbot" && <Chatbot inline />}
      </main>
      <Footer />

      {/* Floating Chat */}
      <ChatFAB onClick={()=>setChatOpen(true)} />
      {chatOpen && <Chatbot onClose={()=>setChatOpen(false)} />}
    </div>
  );
}

/******************** navbar ********************/ 
function Nav({ tab, setTab }){
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Logo />
        <nav className="ml-2 hidden lg:flex gap-1">
          {[
            ["home","Home"],
            ["breathe","Breathe"],
            ["community","Community"],
            ["friends","Friends"],
            ["leaderboard","Leaderboard"],
            ["profile","Profile"],
            ["chatbot","Chatbot"],
          ].map(([key,label])=> (
            <button key={key} onClick={()=>setTab(key)}
              className={cls("px-3 py-2 rounded-xl text-sm font-medium",
                tab===key?"bg-gray-900 text-white":"text-gray-700 hover:bg-gray-100")}>{label}</button>
          ))}
        </nav>
        <div className="lg:hidden ml-auto">
          <select value={tab} onChange={e=>setTab(e.target.value)} className="border rounded-lg px-2 py-1">
            <option value="home">Home</option>
            <option value="breathe">Breathe</option>
            <option value="community">Community</option>
            <option value="friends">Friends</option>
            <option value="leaderboard">Leaderboard</option>
            <option value="profile">Profile</option>
            <option value="chatbot">Chatbot</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* TODO: Google Login */}
          <button className="px-3 py-2 text-sm rounded-xl border hover:bg-gray-50">Log in</button>
          <button className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-white">Sign up</button>
        </div>
      </div>
    </header>
  );
}

function Logo(){
  return (
    <div className="flex items-center gap-2 font-semibold text-lg">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">Z</span>
      ZenithPath
    </div>
  );
}

/******************** home/dashboard ********************/ 
function Home(){
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 grid gap-6">
        <WelcomeCard />
        <StreakCard />
        <QuickStart />
      </div>
      <div className="grid gap-6">
        <BreatheTimer seconds={120} />
        <Roadmap />
        <ReminderDemo />
      </div>
    </div>
  );
}

function WelcomeCard(){
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold">Welcome back 👋</h2>
        <p className="mt-1 text-gray-600">Build calm, focus, and consistency—one tiny step at a time.</p>
      </div>
    </Card>
  );
}

function StreakCard(){
  const { streak, checkedToday, checkIn, chartData } = useStreak();
  return (
    <Card>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Streak</h3>
          <span className="text-sm text-gray-600">{checkedToday?"Checked in today":"You haven't checked in yet"}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gray-900 text-white grid place-items-center text-2xl font-bold">{streak}</div>
          <div className="flex-1">
            <Sparkline data={chartData} />
            <p className="text-xs text-gray-500 mt-2">Last 30 days check‑ins</p>
          </div>
          <button onClick={checkIn} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Check in</button>
        </div>
      </div>
    </Card>
  );
}

function QuickStart(){
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3">Quick start</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <QSItem title="2‑min Breathe" desc="Box breathing 4‑4‑4‑4" pill="Calm" />
          <QSItem title="Gratitude note" desc="Write 1 thing you liked" pill="Mood" />
          <QSItem title="Water break" desc="Sip 250 ml" pill="Health" />
        </div>
      </div>
    </Card>
  );
}

function QSItem({ title, desc, pill }){
  return (
    <button className="text-left rounded-2xl border p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-600">{desc}</div>
        </div>
        <span className="text-xs px-2 py-1 rounded-lg bg-gray-900 text-white">{pill}</span>
      </div>
    </button>
  );
}

function Roadmap(){
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Rules</h3>
        <ul className="text-sm grid gap-2 list-disc pl-5">
          <li>Be happy</li>
          <li>Don't be sad</li>
          <li>Never think you are alone</li>
        </ul>
      </div>
    </Card>
  );
}

/******************** breathe ********************/ 
function Breathe(){
  const [exercise, setExercise] = useState("box"); // only one exercise for now
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <div className="p-6 grid gap-3">
          <h3 className="text-lg font-semibold">Breathing Exercise</h3>
          <label className="text-sm text-gray-600">Select exercise</label>
          <select value={exercise} onChange={e=>setExercise(e.target.value)} className="border rounded-xl p-2 w-full">
            <option value="box">Box Breathing (4‑4‑4‑4)</option>
          </select>
          <p className="text-sm text-gray-600">Follow the guide and the countdown below.</p>
        </div>
      </Card>
      <BreatheTimer key={exercise} seconds={120} pattern={exercise} />
    </div>
  );
}

function BreatheTimer({ seconds=120, pattern="box" }){
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("Inhale");
  const intRef = useRef(null);
  const phaseRef = useRef(null);

  const steps = pattern === "box"
    ? [ ["Inhale",4], ["Hold",4], ["Exhale",4], ["Hold",4] ]
    : [ ["Inhale",4], ["Hold",4], ["Exhale",4], ["Hold",4] ];

  useEffect(() => { return () => { clearInterval(intRef.current); clearInterval(phaseRef.current); }; }, []);
  useEffect(() => { if(left===0) setRunning(false); }, [left]);

  const start = () => {
    if (running) return;
    setRunning(true);
    intRef.current = setInterval(()=> setLeft(t=> Math.max(0, t-1)), 1000);
    let i=0; let sLeft = steps[0][1]; setPhase(steps[0][0]);
    phaseRef.current = setInterval(()=>{
      if (--sLeft <= 0){ i = (i+1)%steps.length; setPhase(steps[i][0]); sLeft = steps[i][1]; }
    }, 1000);
  };
  const pause = () => { setRunning(false); clearInterval(intRef.current); clearInterval(phaseRef.current); };
  const reset = () => { pause(); setLeft(seconds); setPhase("Inhale"); };

  const mm = String(Math.floor(left/60)).padStart(2,"0");
  const ss = String(left%60).padStart(2,"0");
  const pct = (1 - left/seconds) * 100;

  return (
    <Card>
      <div className="p-6 grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">A Moment of Calm</h3>
          <span className="text-xs px-2 py-1 rounded-lg bg-gray-900 text-white">2‑minute session</span>
        </div>
        <div className="text-5xl font-bold tabular-nums text-center">{mm}:{ss}</div>
        <div className="grid place-items-center">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full border-8 border-gray-200"/>
            <div className="absolute inset-0 rounded-full border-8 border-gray-900" style={{ clipPath: `inset(${100-pct}% 0 0 0)` }}/>
            <div className="absolute inset-0 grid place-items-center">
              <div className={cls("transition-all duration-500 rounded-full bg-gray-900/10", phase==="Inhale"||phase==="Hold"?"h-24 w-24":"h-16 w-16")}></div>
            </div>
          </div>
        </div>
        <div className="grid sm:flex gap-2 sm:justify-center">
          <button onClick={start} disabled={running||left===0} className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60">Start</button>
          <button onClick={pause} disabled={!running} className="px-4 py-2 rounded-xl border">Pause</button>
          <button onClick={reset} className="px-4 py-2 rounded-xl border">Reset</button>
        </div>
        <div className="text-center text-sm text-gray-700"><span className="px-2 py-1 rounded-lg bg-gray-100">{phase}</span></div>
      </div>
    </Card>
  );
}

/******************** streak hook + sparkline ********************/ 
function useStreak(){
  const [lastCheckIn, setLast] = useState(()=> readLS("zp:last", 0));
  const [streak, setStreak] = useState(()=> readLS("zp:streak", 0));
  const [history, setHistory] = useState(()=> readLS("zp:history", []));
  const todayKey = new Date().toISOString().slice(0,10);
  const checkedToday = history.includes(todayKey);

  const checkIn = () => {
    const now = Date.now();
    const last = lastCheckIn;
    const diffDays = last ? Math.floor((new Date().setHours(0,0,0,0) - new Date(last).setHours(0,0,0,0))/86400000) : null;
    let s = streak;
    if (!last || diffDays===null) s = 1; else if (diffDays===1) s = s+1; else if (diffDays===0) s=s; else s=1;
    const nh = Array.from(new Set([...history, todayKey]));
    setStreak(s); setLast(now); setHistory(nh);
    writeLS("zp:streak", s); writeLS("zp:last", now); writeLS("zp:history", nh);
  };

  const chartData = useMemo(()=>{
    return Array.from({length:30}, (_,i)=>{
      const d = new Date(Date.now() - (29-i)*86400000);
      const key = d.toISOString().slice(0,10);
      return { x:i, y: history.includes(key)?1:0 };
    });
  },[history]);

  return { streak, checkedToday, checkIn, chartData };
}

function Sparkline({ data }){
  const width=260, height=60, pad=6;
  const points = data.map((d,i)=>{
    const x = pad + (i*(width-2*pad))/(data.length-1);
    const y = height - pad - d.y*(height-2*pad);
    return `${x},${y}`;
  }).join(" ");
  const total = data.reduce((a,b)=>a+b.y,0);
  return (
    <div className="inline-flex items-center gap-3">
      <svg width={width} height={height} className="rounded-xl bg-gray-100">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
      </svg>
      <span className="text-sm text-gray-700">{total} check‑ins</span>
    </div>
  );
}

/******************** community ********************/ 
const seedPosts = [
  { id: 1, user: "Aarav", text: "Day 3 on ZenithPath ✨ Feeling calmer already.", likes: 12, ts: Date.now()-36e5*12 },
  { id: 2, user: "Isha", text: "Breathwork session nailed. Who wants to pair up?", likes: 7, ts: Date.now()-36e5*30 },
];

function Community(){
  const [posts, setPosts] = useState(()=> readLS("zp:posts", seedPosts));
  const [text, setText] = useState("");
  const [img, setImg] = useState("");

  useEffect(()=> writeLS("zp:posts", posts), [posts]);

  const addPost = () => {
    if(!text.trim() && !img) return;
    setPosts(p => [{ id: Date.now(), user: "You", text, img, likes: 0, ts: Date.now() }, ...p]);
    setText(""); setImg("");
  };

  const onPick = (e) => {
    const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = () => setImg(r.result); r.readAsDataURL(f);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <div className="p-6 grid gap-3">
          <h3 className="text-lg font-semibold">Create Post</h3>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Share something uplifting…" rows={3} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-300"/>
          {img && <img src={img} alt="attachment" className="rounded-xl border"/>}
          <div className="flex items-center gap-3 justify-end">
            <input id="imgPick" type="file" accept="image/*" className="hidden" onChange={onPick}/>
            <button onClick={()=>document.getElementById("imgPick").click()} className="px-3 py-2 rounded-xl border">Add image</button>
            <button onClick={addPost} className="px-4 py-2 rounded-xl bg-gray-900 text-white">Post</button>
          </div>
        </div>
      </Card>

      {posts.map(p => (
        <Card key={p.id}>
          <div className="p-5 grid gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={p.user} />
              <div>
                <div className="font-medium">{p.user}</div>
                <div className="text-xs text-gray-600">{new Date(p.ts).toLocaleString()}</div>
              </div>
            </div>
            <p className="leading-relaxed">{p.text}</p>
            {p.img && <img src={p.img} alt="post" className="rounded-xl border"/>}
            <div>
              <button onClick={()=> setPosts(list=> list.map(x=> x.id===p.id?{...x,likes:x.likes+1}:x))} className="px-3 py-1 rounded-lg border">❤️ {p.likes}</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/******************** friends ********************/ 
function Friends(){
  const [tab, setTab] = useState("mine");
  const [friends, setFriends] = useState(()=> readLS("zp:friends", ["Aarav","Isha","Kabir"]));
  const [requests, setRequests] = useState(()=> readLS("zp:reqs", ["Diya","Rohan"]));
  const [query, setQuery] = useState("");

  useEffect(()=> writeLS("zp:friends", friends), [friends]);
  useEffect(()=> writeLS("zp:reqs", requests), [requests]);

  const add = (name) => setFriends(f=> Array.from(new Set([...f, name])));
  const accept = (name) => { setRequests(r=> r.filter(x=>x!==name)); add(name); };
  const suggested = ["Meera","Vivaan","Ananya","Advait","Neel"].filter(n => n.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid gap-6">
      <Card>
        <div className="px-5 pt-5">
          <h3 className="text-lg font-semibold">Friends</h3>
        </div>
        <div className="px-2 pt-3 flex gap-2">
          {[
            ["mine","My Friends"],
            ["req","Requests"],
            ["find","Find"],
          ].map(([key,label])=> (
            <button key={key} onClick={()=>setTab(key)} className={cls("px-3 py-2 rounded-xl text-sm",
              tab===key?"bg-gray-900 text-white":"border")}>{label}</button>
          ))}
        </div>
        <div className="p-5">
          {tab==="mine" && (
            <div className="grid gap-2">
              {friends.length===0 && <div className="text-gray-600">No friends yet.</div>}
              {friends.map(n => (
                <Row key={n} left={<Avatar name={n}/>} mid={<div className="font-medium">{n}</div>} right={<span className="text-xs px-2 py-1 rounded-lg bg-gray-100">Streak {Math.floor(Math.random()*10)+1}</span>} />
              ))}
            </div>
          )}
          {tab==="req" && (
            <div className="grid gap-2">
              {requests.length===0 && <div className="text-gray-600">No requests.</div>}
              {requests.map(n => (
                <Row key={n} left={<Avatar name={n}/>} mid={<div className="font-medium">{n}</div>} right={
                  <div className="flex gap-2">
                    <button onClick={()=>accept(n)} className="px-3 py-1 rounded-lg bg-gray-900 text-white">Accept</button>
                    <button onClick={()=>setRequests(r=> r.filter(x=>x!==n))} className="px-3 py-1 rounded-lg border">Ignore</button>
                  </div>
                } />
              ))}
            </div>
          )}
          {tab==="find" && (
            <div className="grid gap-3">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people…" className="w-full border rounded-xl p-2"/>
              <div className="grid gap-2">
                {suggested.map(n => (
                  <Row key={n} left={<Avatar name={n}/>} mid={<div className="font-medium">{n}</div>} right={<button onClick={()=>add(n)} className="px-3 py-1 rounded-lg bg-gray-900 text-white">Add</button>} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/******************** leaderboard (mock) ********************/ 
function Leaderboard(){
  const friends = readLS("zp:friends", ["Aarav","Isha","Kabir","Meera","Rohan"]);
  const me = readLS("zp:name","You");
  const myStreak = readLS("zp:streak", 1);
  const rows = [ {name: me, streak: myStreak}, ...friends.map(n=> ({ name: n, streak: Math.max(1, Math.floor(Math.random()*12)) })) ];
  rows.sort((a,b)=> b.streak - a.streak);
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3">Leaderboard (weekly)</h3>
        <div className="grid gap-2">
          {rows.map((r,i)=> (
            <div key={r.name} className={cls("flex items-center gap-3 border rounded-xl p-3", i<3 && "bg-yellow-50")}> 
              <span className="w-7 text-center font-semibold">{i+1}</span>
              <Avatar name={r.name} />
              <div className="flex-1 font-medium">{r.name}</div>
              <span className="px-2 py-1 rounded-lg bg-gray-900 text-white text-xs">Streak {r.streak}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/******************** reminders demo ********************/ 
function ReminderDemo(){
  const [perm, setPerm] = useState(Notification?.permission || "default");
  const ask = async () => { try { const p = await Notification.requestPermission(); setPerm(p); } catch {}
  };
  const demo = () => {
    if (perm!=="granted") return;
    new Notification("ZenithPath", { body: "Time for a 2‑min breathe ✨" });
  };
  return (
    <Card>
      <div className="p-6 grid gap-2">
        <h3 className="text-lg font-semibold">Reminders</h3>
        <p className="text-sm text-gray-600">Enable browser notifications to receive gentle nudges.</p>
        <div className="flex gap-2">
          <button onClick={ask} className="px-3 py-2 rounded-xl border">Enable notifications</button>
          <button onClick={demo} className="px-3 py-2 rounded-xl bg-gray-900 text-white" disabled={perm!=="granted"}>Send demo reminder</button>
        </div>
        {perm!=="granted" && <span className="text-xs text-gray-500">Permission status: {perm}</span>}
      </div>
    </Card>
  );
}

/* ****************** chatbot ******************** */ 
function ChatFAB({ onClick }){
  return (
    <button onClick={onClick} className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-gray-900 text-white shadow-lg grid place-items-center text-2xl">💬</button>
  );
}
const BOT_WELCOME = "Hi! I’m Zenith — here to help with breathing, motivation, and streaks. Try: ‘I feel anxious’, ‘how to breathe?’, or ‘boost my streak’.";
const CRISIS_MSG = `I'm really glad you told me. You deserve support and you’re not alone.

If you're in immediate danger, call **112** (India) or go to the nearest emergency department.

You can also reach free, confidential help right now in India:
• **Tele MANAS**: 14416 (24/7)
• **KIRAN** Mental Health Helpline: 1800-599-0019 (24/7)
• **AASRA**: aasra.info/helpline
• **iCALL (TISS)**: 022-2552-1111 or 9152987821

If you want, we can do a short grounding breath together: Inhale 4, hold 4, exhale 4, hold 4 — repeat 3 rounds.`;

function Chatbot({ onClose, inline = false }) {
  const [messages, setMessages] = useState(() =>
    readLS("zp:chat", [{ role: "bot", text: BOT_WELCOME }])
  );
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => writeLS("zp:chat", messages), [messages]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    const botMsg = { role: "bot", text: reply(text) };


const send = async (text) => {
  if (!text.trim()) return;
  const userMsg = { role: "user", text };
  const botReply = await sendToAPI(text);
  const botMsg = { role: "bot", text: botReply };
  setMessages((m) => [...m, userMsg, botMsg]);
  setInput("");
};

    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  const reply = (t) => {
    const s = t.toLowerCase();

    if (
      /(suicid|kill myself|end my life|take my life|self[- ]?harm|hurt myself|i want to die|i don't want to live)/.test(
        s
      )
    )
      return CRISIS_MSG;

    if (/(anxious|stress|panic|overwhelm)/.test(s))
      return "Try box breathing: inhale 4, hold 4, exhale 4, hold 4. Do 3 rounds — I’m with you. 🧘";

    if (/(breathe|breath|exercise)/.test(s))
      return "Best starter: Box 4-4-4-4. Tap Breathe → Start. Keep shoulders relaxed, slow nose breathing.";

    if (/(streak|motivat|habit|discipline)/.test(s))
      return "Do a 2-min session now and check-in on Home. Tiny steps compound 🔥";

    if (/(hello|hi|hey)/.test(s))
      return "Hey! What do you want to do — breathe, boost streak, or post in community?";

    if (/(sleep)/.test(s))
      return "Try 4-7-8 once in bed: inhale 4, hold 7, exhale 8. Repeat 4 times.";

    return "I didn’t get that fully — try: ‘I feel anxious’, ‘how to breathe?’, or ‘boost my streak’.";
  };

  const shell = (
    <Card className={inline ? "" : "fixed bottom-24 right-5 w-[min(92vw,380px)]"}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-semibold">Zenith Chatbot</div>
        {!inline && (
          <button onClick={onClose} className="text-sm px-2 py-1 rounded-lg border">
            Close
          </button>
        )}
      </div>

      <div ref={listRef} className="max-h-80 overflow-auto p-4 grid gap-2 bg-gray-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={cls(
              "px-3 py-2 rounded-xl max-w-[85%]",
              m.role === "bot"
                ? "bg-white border self-start"
                : "bg-gray-900 text-white justify-self-end"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Type a message…"
          className="flex-1 border rounded-xl p-2"
        />
        <button
          onClick={() => send(input)}
          className="px-3 py-2 rounded-xl bg-gray-900 text-white"
        >
          Send
        </button>
      </div>
    </Card>
  );

  return shell;
}

/******************** profile ********************/ 
function Profile(){
  const [name, setName] = useState(()=> readLS("zp:name","Username"));
  const [bio, setBio] = useState(()=> readLS("zp:bio","Your Bio"));
  const [avatar, setAvatar] = useState(()=> readLS("zp:avatar", ""));

  useEffect(()=> writeLS("zp:name", name), [name]);
  useEffect(()=> writeLS("zp:bio", bio), [bio]);
  useEffect(()=> writeLS("zp:avatar", avatar), [avatar]);

  const onPick = (e) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = ()=> setAvatar(r.result); r.readAsDataURL(f); };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <div className="p-6 grid gap-4">
          <h3 className="text-lg font-semibold">Your Profile</h3>
          <div className="flex items-start gap-5">
            <div>
              <Avatar name={name} big url={avatar} />
            </div>
            <div className="grid gap-3 flex-1">
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-xl p-2 mt-1"/>
              </div>
              <div>
                <label className="text-sm text-gray-600">Bio</label>
                <input value={bio} onChange={e=>setBio(e.target.value)} className="w-full border rounded-xl p-2 mt-1"/>
              </div>
              <div className="flex items-center gap-2">
                <input id="pickAvatar" type="file" accept="image/*" className="hidden" onChange={onPick}/>
                <button onClick={()=>document.getElementById("pickAvatar").click()} className="px-3 py-2 rounded-xl border">Upload avatar</button>
                <button onClick={()=>setAvatar("")} className="px-3 py-2 rounded-xl border">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="p-6 grid gap-3">
          <h4 className="font-semibold">Account</h4>
          <button className="px-3 py-2 rounded-xl border">Export data (JSON)</button>
          <button className="px-3 py-2 rounded-xl border">Delete account</button>
          <div className="text-xs text-gray-500">(Buttons are placeholders for now)</div>
        </div>
      </Card>
    </div>
  );
}

/******************** atoms ********************/ 
function Card({ children, className }){
  return <section className={cls("rounded-2xl border bg-white shadow-sm", className)}>{children}</section>;
}

function Avatar({ name = "U", url = "", big=false }){
  const initials = (name||"U").split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
  const size = big?"h-20 w-20 text-xl":"h-10 w-10";
  return (
    <div className={cls("rounded-2xl bg-gray-900 text-white grid place-items-center overflow-hidden", size)}>
      {url? <img src={url} alt="avatar" className="h-full w-full object-cover"/> : initials}
    </div>
  );
}

function Row({ left, mid, right }){
  return (
    <div className="flex items-center gap-3 border rounded-xl p-3">
      <div className="shrink-0">{left}</div>
      <div className="flex-1">{mid}</div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

/******************** footer ********************/ 
function Footer(){
  return (
    <footer className="mt-10 border-t bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} ZenithPath</span>
        <span className="flex gap-3">
          <a className="hover:underline" href="#">Privacy</a>
          <a className="hover:underline" href="#">Terms</a>
          <a className="hover:underline" href="#">Contact</a>
        </span>
      </div>
    </footer>
  );
}
