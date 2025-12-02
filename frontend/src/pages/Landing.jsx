import useAuth from '@/hooks/useAuth';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const {user, loading} = useAuth() ;

  function handleClick(e){
    e.preventDefault() ;
    if(loading){
      alert("loading") ;
      return ;
    }

    if(user && user.role==="admin") navigate("/admin/dashboard") ;
    else navigate("/admin/login") ;
  }

  return (
    <div className="min-h-screen bg-[#1a2332] text-white flex">
      <div className="flex w-full">
        {/* Left Section */}
        <div className="w-1/2 flex items-center px-12 lg:px-16 py-20">
          <div className="max-w-xl pl-16">
            <p className="text-[#6b8299] text-s tracking-[0.2em] font-medium mb-4">
              THE MOST POWERFUL SOLUTION
            </p>

            <h1 className="text-[64px] font-bold leading-[1.1] text-white">
              Manage Your PG
            </h1>
            <h1 className="text-[64px] font-bold leading-[1.1] text-[#ff6b4a] mb-8">
              Effortlessly
            </h1>

            <p className="text-[#c5d0de] text-[17px] leading-relaxed mb-10 w-[600px]">
              A lightweight PG management system for owners and tenants — room allocation, rent tracking, tenant move-ins & move-outs and more.
            </p>

            <div className="flex gap-8">
              <button
                // onClick={() => navigate('/admin/login')}
                onClick={handleClick}
                className="bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] text-white font-semibold px-10 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Admin
              </button>

              <button
                onClick={() => navigate('/tenant/login')}
                className="border-2 border-[#3d4f66] text-white font-semibold px-10 py-2 rounded-lg hover:border-[#4d5f76] transition-colors"
              >
                Tenant
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-[#ff6b4a] flex items-center justify-center px-12 lg:px-16 py-20">
          <div className="max-w-lg">
            <h2 className="text-white text-4xl font-bold mb-12">Key Features</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">Room Management</h3>
                  <p className="text-white/90 text-sm">Easily allocate and track room availability in real-time</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">Rent Tracking</h3>
                  <p className="text-white/90 text-sm">Automated rent collection and payment reminders</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">Tenant Management</h3>
                  <p className="text-white/90 text-sm">Handle move-ins, move-outs, and tenant records effortlessly</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">Reports & Analytics</h3>
                  <p className="text-white/90 text-sm">Get insights on occupancy, revenue, and performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}