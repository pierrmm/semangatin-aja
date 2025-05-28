export default function FloatingElements() {
  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900"></div>
      
      {/* Animated floating elements */}
      <div className="absolute top-10 left-[10%] w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-[30%] right-[15%] w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float-delay"></div>
      <div className="absolute bottom-[20%] left-[20%] w-28 h-28 bg-purple-500/20 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute bottom-[10%] right-[25%] w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-float-delay-slow"></div>
      
      {/* Stars */}
      <div className="absolute inset-0">
        <div className="stars"></div>
      </div>
    </div>
  );
}