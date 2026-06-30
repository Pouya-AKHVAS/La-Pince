import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-slate-900 tracking-widest">404</h1>
        <div className="bg-amber-500 text-white px-2 text-sm rounded rotate-12 absolute translate-y-[-20px] inline-block m-auto left-0 right-0 w-max">
          Page Non Trouvée
        </div>
        <p className="text-slate-600 text-lg mt-8 mb-6">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-colors duration-200"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}