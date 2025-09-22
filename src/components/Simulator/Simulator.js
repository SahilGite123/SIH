import React, { useMemo, useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useTranslation } from 'react-i18next';

const cityMultipliers = { '1': 1.4, '2': 1.0, '3': 0.8 };

const Simulator = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    courseFees: 250000, // INR
    startingSalary: 350000, // INR per year CTC
    rent: 8000,
    food: 4000,
    commute: 1500,
    misc: 2500,
    cityTier: '2', // 1,2,3
    weeklyHours: 45,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: name === 'cityTier' ? value : Number(value) }));
  };

  const reset = () => {
    setInputs({
      courseFees: 250000,
      startingSalary: 350000,
      rent: 8000,
      food: 4000,
      commute: 1500,
      misc: 2500,
      cityTier: '2',
      weeklyHours: 45,
    });
  };

  const results = useMemo(() => {
    const monthlyCTC = inputs.startingSalary / 12; // rough
    const takeHome = monthlyCTC * 0.8; // 20% taxes/other cuts approx
    const monthlyExpensesBase = inputs.rent + inputs.food + inputs.commute + inputs.misc;
    const monthlyExpenses = monthlyExpensesBase * cityMultipliers[inputs.cityTier];
    const surplus = Math.round(takeHome - monthlyExpenses);
    const recoveryYears = Math.max(0, inputs.courseFees / Math.max(1, surplus) / 12);

    // Simple work-life score (lower hours => better)
    const wlbScore = Math.max(0, Math.min(10, 10 - (inputs.weeklyHours - 35) * 0.5));

    return {
      monthlyCTC: Math.round(monthlyCTC),
      takeHome: Math.round(takeHome),
      monthlyExpenses: Math.round(monthlyExpenses),
      surplus,
      recoveryYears: Number.isFinite(recoveryYears) ? recoveryYears.toFixed(1) : '∞',
      wlbScore: wlbScore.toFixed(1),
    };
  }, [inputs]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('simulator')}</h1>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Reality Check Simulator</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Inputs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Course Fees (INR)</label>
                <input type="number" name="courseFees" value={inputs.courseFees} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Starting Salary (CTC/yr)</label>
                <input type="number" name="startingSalary" value={inputs.startingSalary} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rent / month</label>
                <input type="number" name="rent" value={inputs.rent} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Food / month</label>
                <input type="number" name="food" value={inputs.food} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Commute / month</label>
                <input type="number" name="commute" value={inputs.commute} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Misc / month</label>
                <input type="number" name="misc" value={inputs.misc} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City Tier</label>
                <select name="cityTier" value={inputs.cityTier} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900">
                  <option value="1">Tier 1 (Metro)</option>
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Work Hours / week</label>
                <input type="number" name="weeklyHours" value={inputs.weeklyHours} onChange={handleChange} className="w-full px-3 py-2 rounded border dark:bg-gray-900" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={reset}>Reset</Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-4 space-y-3">
            <h3 className="font-medium">Results</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <div className="text-gray-500">Monthly CTC</div>
                <div className="text-lg font-semibold">₹ {results.monthlyCTC.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
                <div className="text-gray-500">Est. Take-home</div>
                <div className="text-lg font-semibold">₹ {results.takeHome.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <div className="text-gray-500">Monthly Expenses</div>
                <div className="text-lg font-semibold">₹ {results.monthlyExpenses.toLocaleString('en-IN')}</div>
              </div>
              <div className={`p-3 rounded-lg ${results.surplus >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                <div className="text-gray-500">Surplus / Deficit</div>
                <div className={`text-lg font-semibold ${results.surplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹ {results.surplus.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/30">
                <div className="text-gray-500">Years to recover fees</div>
                <div className="text-lg font-semibold">{results.recoveryYears} yrs</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <div className="text-gray-500">Work-life balance</div>
                <div className="text-lg font-semibold">{results.wlbScore}/10</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Assumptions: 20% deductions, tier multipliers, simple surplus-to-recovery calculation.</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Simulator;
