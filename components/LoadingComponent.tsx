export function Loading({full=false, dark=false}:{full?:boolean, dark?:boolean}) {
  return (
    <div className={  `${full ? "h-screen" : ""} ${dark ? "bg-gray-800":"bg-gray-50"} py-18  flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className={`${dark ? "text-gray-200":"text-gray-600"}`}>Loading ...</p>
      </div>
    </div>
  );
}