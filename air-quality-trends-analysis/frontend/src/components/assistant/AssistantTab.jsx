import GlassPanel from '../common/GlassPanel'
import ChatInterface from './ChatInterface'

export default function AssistantTab(props) {
  return (
    <GlassPanel title="AI Assistant" index={3}>
      <ChatInterface {...props} />
    </GlassPanel>
  )
}


