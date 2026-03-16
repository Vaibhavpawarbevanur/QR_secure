import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  QrCode, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Code, 
  Info,
  Camera,
  ShieldAlert,
  ShieldCheck,
  RefreshCcw,
  Github,
  ExternalLink
} from 'lucide-react';
import { cn } from './lib/utils';
import { QRScanner } from './components/QRScanner';
import { CodeBlock } from './components/CodeBlock';

// --- Constants & Types ---

const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'bank', 'update', 'free', 'prize', 'gift', 'password', 'otp'];

interface User {
  username: string;
  passwordHash: string;
}

type AppState = 'menu' | 'register' | 'login' | 'dashboard' | 'scanner' | 'code';

// --- Python Source Code ---

const PYTHON_CODE = `import cv2
import json
import hashlib
from pyzbar.pyzbar import decode
import time

# --- Configuration ---
USER_DATA_FILE = "users.json"
MAX_ATTEMPTS = 3
SUSPICIOUS_KEYWORDS = ['login', 'verify', 'bank', 'update', 'free', 'prize', 'gift', 'password', 'otp']

def hash_password(password):
    """Hashes a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    """Loads users from the JSON file."""
    try:
        with open(USER_DATA_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_users(users):
    """Saves users to the JSON file."""
    with open(USER_DATA_FILE, "w") as f:
        json.dump(users, f, indent=4)

def register():
    """Handles user registration."""
    print("\\n--- User Registration ---")
    username = input("Enter new username: ")
    users = load_users()
    
    if username in users:
        print("Username already exists!")
        return
        
    password = input("Enter new password: ")
    users[username] = hash_password(password)
    save_users(users)
    print("✅ Registration successful!")

def login():
    """Handles user login with attempt protection."""
    print("\\n--- User Login ---")
    username = input("Username: ")
    users = load_users()
    
    if username not in users:
        print("User not found!")
        return None

    attempts = 0
    while attempts < MAX_ATTEMPTS:
        password = input(f"Password (Attempt {attempts + 1}/{MAX_ATTEMPTS}): ")
        if hash_password(password) == users[username]:
            print(f"✅ Welcome, {username}!")
            return username
        else:
            print("❌ Incorrect password.")
            attempts += 1
            
    print("\\nAccount temporarily locked due to multiple failed login attempts.")
    return None

def detect_phishing(data):
    """Detects potential phishing in QR data."""
    data_lower = data.lower()
    is_suspicious = any(keyword in data_lower for keyword in SUSPICIOUS_KEYWORDS)
    
    if is_suspicious:
        return "⚠ Potential Phishing QR Code Detected"
    elif data.startswith("https"):
        return "✅ Safe QR Code"
    else:
        return "ℹ Generic Data Detected"

def start_scanner():
    """Starts the webcam QR scanner."""
    print("\\n--- Secure QR Scanner Active ---")
    print("Press 'q' to exit scanner.")
    
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Decode QR codes
        for obj in decode(frame):
            qr_data = obj.data.decode('utf-8')
            print(f"\\n[SCAN FOUND] Data: {qr_data}")
            
            # Phishing Detection
            result = detect_phishing(qr_data)
            print(result)
            
            # Draw rectangle around QR
            (x, y, w, h) = obj.rect
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, result, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Pause briefly to show result
            time.sleep(2)

        cv2.imshow("Secure QR Scanner", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

def main():
    while True:
        print("\\n--- Secure QR Scanner System ---")
        print("1. Register")
        print("2. Login")
        print("3. Exit")
        
        choice = input("Select an option: ")
        
        if choice == '1':
            register()
        elif choice == '2':
            user = login()
            if user:
                start_scanner()
        elif choice == '3':
            print("Exiting...")
            break
        else:
            print("Invalid choice!")

if __name__ == "__main__":
    main()
`;

// --- Components ---

export default function App() {
  const [state, setState] = useState<AppState>('menu');
  const [users, setUsers] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [scanResult, setScanResult] = useState<{ data: string; status: 'safe' | 'phishing' | 'neutral' } | null>(null);

  // Load users from "local storage" (simulating the JSON file)
  useEffect(() => {
    const savedUsers = localStorage.getItem('qr_scanner_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const saveUsersToStorage = (newUsers: Record<string, string>) => {
    localStorage.setItem('qr_scanner_users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (users[username]) {
      alert('Username already exists!');
      return;
    }

    // In a real app, we'd hash this. For the demo, we'll just store it.
    // The Python code provided uses SHA-256.
    const newUsers = { ...users, [username]: password };
    saveUsersToStorage(newUsers);
    alert('Registration successful!');
    setState('menu');
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (users[username] === password) {
      setCurrentUser(username);
      setLoginAttempts(0);
      setState('dashboard');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 30000); // Lock for 30 seconds for demo
      }
    }
  };

  const handleScan = useCallback((data: string) => {
    const dataLower = data.toLowerCase();
    const isSuspicious = SUSPICIOUS_KEYWORDS.some(keyword => dataLower.includes(keyword));
    
    let status: 'safe' | 'phishing' | 'neutral' = 'neutral';
    if (isSuspicious) {
      status = 'phishing';
    } else if (data.startsWith('https')) {
      status = 'safe';
    }

    setScanResult({ data, status });
  }, []);

  const logout = () => {
    setCurrentUser(null);
    setState('menu');
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setState('menu')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="text-emerald-500" size={20} />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg">QR Secure</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Cyber Lab v1.0</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setState('code')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                state === 'code' ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Code size={16} />
              <span className="hidden sm:inline">Python Code</span>
            </button>
            {currentUser && (
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {/* Menu State */}
          {state === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter text-white">
                  Secure QR <span className="text-emerald-500">Scanner</span>
                </h2>
                <p className="text-zinc-400 text-lg max-w-lg mx-auto">
                  A beginner-friendly cybersecurity project demonstrating user authentication, 
                  password hashing, and phishing detection.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setState('register')}
                  className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserPlus size={80} />
                  </div>
                  <UserPlus className="text-emerald-500 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">Register</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Create a new account. Credentials will be stored securely using SHA-256 hashing.
                  </p>
                </button>

                <button 
                  onClick={() => setState('login')}
                  className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LogIn size={80} />
                  </div>
                  <LogIn className="text-blue-500 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-white mb-2">Login</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Access the secure scanner. Protected by a 3-attempt brute-force prevention system.
                  </p>
                </button>
              </div>

              <div className="pt-8 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <ShieldCheck size={16} /> SHA-256 Hashing
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Terminal size={16} /> Python 3.x
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Camera size={16} /> OpenCV
                </div>
              </div>
            </motion.div>
          )}

          {/* Register State */}
          {state === 'register' && (
            <motion.div 
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <UserPlus className="text-emerald-500" size={24} />
                  <h2 className="text-2xl font-bold text-white">Create Account</h2>
                </div>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Username</label>
                    <input 
                      name="username"
                      required
                      type="text" 
                      placeholder="Enter username"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Password</label>
                    <input 
                      name="password"
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Register User
                  </button>
                  <button 
                    type="button"
                    onClick={() => setState('menu')}
                    className="w-full py-3 rounded-xl text-zinc-400 hover:text-white transition-all text-sm"
                  >
                    Back to Menu
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Login State */}
          {state === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                {isLocked && (
                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-center flex-col items-center justify-center p-8 text-center space-y-4">
                    <AlertTriangle className="text-red-500" size={48} />
                    <h3 className="text-xl font-bold text-white">Account Locked</h3>
                    <p className="text-sm text-zinc-400">
                      Account temporarily locked due to multiple failed login attempts. 
                      Please wait 30 seconds.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-8">
                  <LogIn className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-bold text-white">Security Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Username</label>
                    <input 
                      name="username"
                      required
                      type="text" 
                      placeholder="Enter username"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Password</label>
                      {loginAttempts > 0 && (
                        <span className="text-[10px] text-red-500 font-mono">
                          Attempts: {loginAttempts}/3
                        </span>
                      )}
                    </div>
                    <input 
                      name="password"
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Authenticate
                  </button>
                  <button 
                    type="button"
                    onClick={() => setState('menu')}
                    className="w-full py-3 rounded-xl text-zinc-400 hover:text-white transition-all text-sm"
                  >
                    Back to Menu
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Dashboard State */}
          {state === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500 text-sm font-mono uppercase tracking-widest">
                    <ShieldCheck size={16} /> Authenticated Session
                  </div>
                  <h2 className="text-4xl font-bold text-white">Welcome, {currentUser}</h2>
                  <p className="text-zinc-500">You now have access to the secure scanning environment.</p>
                </div>
                <button 
                  onClick={() => setState('scanner')}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                >
                  <Camera size={20} />
                  Launch Secure Scanner
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Lock size={24} />
                  </div>
                  <h3 className="font-bold text-white">Hashing Active</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Your password is never stored in plain text. We use SHA-256 to generate a unique 64-character hash.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="font-bold text-white">Phishing Shield</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    The scanner automatically checks for keywords like 'bank', 'prize', or 'login' to detect malicious URLs.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <RefreshCcw size={24} />
                  </div>
                  <h3 className="font-bold text-white">Brute Force Protection</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Multiple failed attempts trigger an automatic account lockout to prevent unauthorized access.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scanner State */}
          {state === 'scanner' && (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Camera size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Live Scanner</h2>
                </div>
                <button 
                  onClick={() => setState('dashboard')}
                  className="text-sm text-zinc-500 hover:text-white transition-all"
                >
                  Close Scanner
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <QRScanner onScan={handleScan} />
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3 text-xs text-zinc-500">
                    <Info size={14} className="flex-shrink-0" />
                    Point your camera at a QR code to analyze its security.
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 min-h-[300px] flex flex-col">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">Analysis Result</h3>
                    
                    {!scanResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <QrCode size={48} />
                        <p className="text-sm">Waiting for QR code...</p>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-mono text-zinc-500">Raw Data</label>
                          <div className="p-4 rounded-xl bg-black border border-white/10 font-mono text-sm break-all">
                            {scanResult.data}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-mono text-zinc-500">Security Status</label>
                          
                          {scanResult.status === 'phishing' && (
                            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
                              <ShieldAlert className="text-red-500 flex-shrink-0" size={24} />
                              <div>
                                <h4 className="font-bold text-red-500 mb-1">Potential Phishing Detected</h4>
                                <p className="text-xs text-red-400/80 leading-relaxed">
                                  This QR code contains suspicious keywords associated with phishing attacks. 
                                  Do not enter any sensitive information.
                                </p>
                              </div>
                            </div>
                          )}

                          {scanResult.status === 'safe' && (
                            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
                              <div>
                                <h4 className="font-bold text-emerald-500 mb-1">Safe QR Code</h4>
                                <p className="text-xs text-emerald-400/80 leading-relaxed">
                                  This URL uses HTTPS and does not contain known phishing keywords.
                                </p>
                              </div>
                            </div>
                          )}

                          {scanResult.status === 'neutral' && (
                            <div className="p-6 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-start gap-4">
                              <Info className="text-zinc-400 flex-shrink-0" size={24} />
                              <div>
                                <h4 className="font-bold text-zinc-300 mb-1">Generic Data</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                  This QR code contains plain text or a non-standard URL. Proceed with caution.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setScanResult(null)}
                          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm font-medium"
                        >
                          Clear Result
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Code State */}
          {state === 'code' && (
            <motion.div 
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-white">Python Implementation</h2>
                  <p className="text-zinc-500">Complete source code for your Cyber Security mini project.</p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="https://www.python.org/downloads/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-sm hover:bg-zinc-800 transition-all"
                  >
                    <ExternalLink size={14} />
                    Get Python
                  </a>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <CodeBlock code={PYTHON_CODE} />
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-6">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Terminal size={18} className="text-emerald-500" />
                      Setup Instructions
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 1: Install Libraries</p>
                        <div className="p-3 rounded-lg bg-black font-mono text-xs text-emerald-500/80 border border-white/5">
                          pip install opencv-python pyzbar
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 2: Save Code</p>
                        <p className="text-sm text-zinc-400">
                          Copy the code on the left and save it as <code className="text-emerald-500">secure_qr.py</code>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 3: Run Project</p>
                        <div className="p-3 rounded-lg bg-black font-mono text-xs text-emerald-500/80 border border-white/5">
                          python secure_qr.py
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-sm font-bold text-white mb-3">Key Concepts</h4>
                      <ul className="space-y-2">
                        {[
                          { icon: ShieldCheck, text: "SHA-256 Hashing" },
                          { icon: Lock, text: "Brute Force Prevention" },
                          { icon: AlertTriangle, text: "Phishing Detection" },
                          { icon: Camera, text: "Real-time CV Analysis" }
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                            <item.icon size={14} className="text-emerald-500/50" />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <h3 className="font-bold text-emerald-500 mb-2">Presentation Tip</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Explain that hashing is a one-way function. Even if an attacker steals the <code className="text-zinc-300">users.json</code> file, 
                      they cannot easily reverse the hashes to find the original passwords.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Shield size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Secure QR Scanner Lab</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-white transition-all">Documentation</a>
            <a href="#" className="hover:text-white transition-all">Security Guide</a>
            <a href="#" className="hover:text-white transition-all">Report Issue</a>
          </div>
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            Built for Education & Awareness
          </div>
        </div>
      </footer>
    </div>
  );
}
