import Layout from '@/components/Layout';
import ComplexityAnalyzer from '@/components/ComplexityAnalyzer';
import DataStructuresVisualizer from '@/components/DataStructuresVisualizer';
import RecursionVisualizer from '@/components/RecursionVisualizer';
import { BookOpen } from 'lucide-react';

export default function Skills() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-900">מיומנויות וכלים</h1>
          </div>
          <p className="text-sm text-slate-500">כלים ויזואליים להבנת מושגים במדעי המחשב</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplexityAnalyzer />
          <DataStructuresVisualizer />
          <div className="lg:col-span-2">
            <RecursionVisualizer />
          </div>
        </div>
      </div>
    </Layout>
  );
}
