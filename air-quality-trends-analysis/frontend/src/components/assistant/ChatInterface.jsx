import { useEffect, useRef } from 'react'
import DarkInputField from '../common/DarkInputField'
import AuroraButton from '../common/AuroraButton'
import ChatMessage from './ChatMessage'
import { fmtPM } from '../../utils/formatters'

function prettyStep(step, idx) {
  const { name, arguments: args = {} } = step || {};
  const parts = [];
  if (args.city) parts.push(`city: ${args.city}`);
  if (Array.isArray(args.cities)) parts.push(`cities: ${args.cities.join(", ")}`);
  if (args.days != null) parts.push(`days: ${args.days}`);
  if (args.horizonDays != null) parts.push(`horizon: ${args.horizonDays}d`);
  if (args.trainDays != null) parts.push(`train: ${args.trainDays}d`);
  return (
    <div key={idx} className="flex items-center gap-2 py-1">
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200">
        {idx + 1}
      </span>
      <span className="text-amber-100 font-medium">{name}</span>
      {parts.length > 0 && (
        <span className="text-amber-200/80 text-sm">({parts.join(" • ")})</span>
      )}
    </div>
  );
}

export default function ChatInterface({ prompt, setPrompt, plan, agentOut, agentLoading, doAgentPlan, doAgentExecute }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [agentOut, plan])

  // Derive actionable steps *safely*
  const rawSteps = Array.isArray(plan?.plan) ? plan.plan.filter(Boolean) : []
  const actionableSteps = rawSteps.filter(isActionableStep)

  // Debug logging
  useEffect(() => {
    if (plan) {
      console.log('=== PLAN DEBUG ===')
      console.log('Full plan object:', JSON.stringify(plan, null, 2))
      console.log('plan.plan exists:', !!plan.plan)
      console.log('plan.plan is array:', Array.isArray(plan.plan))
      console.log('plan.plan length:', plan.plan?.length)
      console.log('actionableSteps length:', actionableSteps.length)
      console.log('plan.irrelevant:', plan.irrelevant)
      console.log('plan.reason:', plan.reason)
      console.log('plan.notes:', plan.notes)
      console.log('==================')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  // ——— Helpers to validate planner output ———
  const isNonEmptyStr = (v) => typeof v === 'string' && v.trim().length > 0
  const isActionableStep = (s) => !!s && (isNonEmptyStr(s.name) || isNonEmptyStr(s.tool))

  // Decide what to show
  const shouldShowPlanned = !plan?.irrelevant && actionableSteps.length > 0
  const shouldShowIrrelevant =
    plan && isNonEmptyStr(prompt) && (
      plan.irrelevant ||
      (Array.isArray(plan.plan) && plan.plan.length > 0 && actionableSteps.length === 0) ||
      (!Array.isArray(plan.plan) && !agentLoading)
    )

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <ChatMessage role="user">{prompt}</ChatMessage>

        {agentOut?.answer && <ChatMessage role="assistant">{agentOut.answer}</ChatMessage>}

        {agentOut?.final?.byCity && (
          <div className="flex justify-start">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 max-w-[80%] text-emerald-200 text-sm">
              <div className="font-semibold mb-1">Execution Result</div>
              {agentOut.final.summary && (
                <div>
                  {Object.entries(agentOut.final.summary).map(([c, s]) => (
                    <div key={c} className="flex items-center justify-between">
                      <span>{c}</span>
                      <span>{fmtPM(s.mean_yhat)}</span>
                    </div>
                  ))}
                  <div className="mt-2">Best: <b>{agentOut.final.best}</b> • Worst: <b>{agentOut.final.worst}</b></div>
                </div>
              )}
              {!agentOut.final.summary && agentOut.final.days && (
                <div>Compared cities for last {agentOut.final.days} days. Best: <b>{agentOut.final.best}</b> • Worst: <b>{agentOut.final.worst}</b></div>
              )}
            </div>
          </div>
        )}

        {shouldShowPlanned && (
          <div className="flex justify-start">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 max-w-[80%]">
              <div className="text-amber-200 text-sm">
                <div className="font-semibold mb-2">Planned Steps</div>
                <div className="space-y-1">
                  {actionableSteps.map((s, i) => prettyStep(s, i))}
                </div>
                {plan?.notes && plan.notes.includes("Unsupported:") && (
                  <div className="mt-3 pt-2 border-t border-amber-500/20">
                    <div className="text-xs text-amber-300/80">
                      <div className="font-medium mb-1">See to Guidelines</div>
                      <div>{plan.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {shouldShowIrrelevant && (
          <div className="flex justify-start">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 max-w-[80%]">
              <div className="text-orange-200 text-sm">
                <div className="font-semibold mb-2">⚠️ Irrelevant Input</div>
                {plan?.reason && <div className="mb-2">{plan.reason}</div>}
                <div>Try:</div>
                <ul className="list-disc ml-5 mt-1">
                  <li>"Compare Colombo, Kandy last 7 days"</li>
                  <li>"Forecast Panadura next 3 days (window 7)"</li>
                  <li>"Scrape & aggregate Galle 2 days"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {(plan?.error || agentOut?.error) && (
          <div className="flex justify-start">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 max-w-[80%]">
              <div className="text-red-200">{plan?.error || agentOut?.error}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <DarkInputField label="Ask about air quality data" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1" placeholder="Compare Colombo and Kandy last 7 days, then forecast both next 7 days..." />
        <div className="flex gap-2">
          <AuroraButton onClick={doAgentPlan} loading={agentLoading}>Plan</AuroraButton>
          {plan?.plan?.length > 0 && !plan?.irrelevant && (
            <AuroraButton onClick={doAgentExecute} loading={agentLoading} variant="success">
              Execute
            </AuroraButton>
          )}
        </div>
      </div>
    </div>
  )
}


