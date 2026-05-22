import { Mic, Send, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { GlassCard } from '@/components/GlassCard';
import { mockAthlete } from '@/data/mockUser';
import { useLocale } from '@/locales';
import { AthleteCoachContext, CoachMessage, getCoachResponse } from '@/services/aiCoach';
import { colors, spacing, typography } from '@/theme/tokens';

const quickPrompts = ['Teknik Analiz', 'Yarış Hazırlığı', 'Sprint', 'Dayanıklılık', 'Recovery', 'Beslenme'];

export default function AiCoachScreen() {
  const { t } = useLocale();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      topic: 'Antrenman',
      content: 'Merhaba. Yarış, teknik, antrenman, recovery, beslenme veya mental hazırlık konusunda sorunu yaz; profiline göre kısa bir yüzme koçu cevabı vereceğim.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const athleteContext: AthleteCoachContext = useMemo(() => ({
    firstName: mockAthlete.firstName,
    age: mockAthlete.age,
    category: mockAthlete.category,
    primaryStroke: '100m Serbest',
    pb: '56.84',
  }), []);

  const handleAsk = async (override?: string) => {
    const trimmed = (override ?? question).trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    const userMessage: CoachMessage = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((current) => keepLastTen([...current, userMessage]));
    setQuestion('');

    const answer = await getCoachResponse(trimmed, athleteContext);
    setMessages((current) => keepLastTen([...current, answer]));
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.hero}>
            <View style={styles.heroIcon}>
              <AppLogo size={40} showTitle={false} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>AI Coach</Text>
              <Text style={styles.subtitle}>Teknik, yarış, antrenman ve recovery için kısa mock koç cevabı.</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.inputCard}>
            <View style={styles.inputRow}>
              <TextInput
                placeholder={t('aiQuestionPlaceholder')}
                placeholderTextColor={colors.muted}
                multiline={true}
                value={question}
                onChangeText={setQuestion}
                style={styles.input}
              />
              <Pressable style={styles.micButton} onPress={() => undefined}>
                <Mic color={colors.mutedStrong} size={20} />
              </Pressable>
            </View>
            <Pressable style={[styles.sendButton, (!question.trim() || isLoading) && styles.sendButtonDisabled]} onPress={() => handleAsk()}>
              <Send color={colors.background} size={18} />
              <Text style={styles.sendText}>{isLoading ? t('aiThinking') : t('send')}</Text>
            </Pressable>
          </GlassCard>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {quickPrompts.map((prompt) => (
              <Pressable key={prompt} style={styles.quickChip} onPress={() => handleAsk(prompt)}>
                <Sparkles color={colors.cyan} size={15} />
                <Text style={styles.quickText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.chat}>
            {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({ message }: { message: CoachMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleWrap, isUser ? styles.userWrap : styles.assistantWrap]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <View style={styles.bubbleHeader}>
          <Text style={[styles.bubbleRole, isUser && styles.userRole]}>{isUser ? 'Sporcu' : 'AI Coach'}</Text>
          {!isUser && message.topic ? <Text style={styles.topicPill}>{message.topic}</Text> : null}
        </View>
        <Text style={styles.bubbleText}>{message.content}</Text>
      </View>
    </View>
  );
}

function keepLastTen(items: CoachMessage[]) {
  return items.slice(-10);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 112 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 21, fontWeight: '700', marginTop: 4 },
  inputCard: { gap: spacing.sm },
  inputRow: { minHeight: 76, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  input: { flex: 1, minHeight: 48, maxHeight: 96, color: colors.text, fontWeight: '800', textAlignVertical: 'top' },
  micButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  sendButton: { minHeight: 48, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, shadowColor: colors.cyan, shadowOpacity: 0.22, shadowRadius: 12, elevation: 4 },
  sendButtonDisabled: { opacity: 0.55 },
  sendText: { color: colors.background, fontWeight: '900' },
  quickRow: { gap: spacing.sm, paddingVertical: 2 },
  quickChip: { minHeight: 40, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  chat: { gap: spacing.md },
  bubbleWrap: { width: '100%' },
  userWrap: { alignItems: 'flex-end' },
  assistantWrap: { alignItems: 'flex-start' },
  bubble: { maxWidth: '88%', borderRadius: 20, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  userBubble: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong, borderTopRightRadius: 6 },
  assistantBubble: { backgroundColor: colors.surfaceSolid, borderColor: colors.borderStrong, borderTopLeftRadius: 6 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  bubbleRole: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  userRole: { color: colors.text },
  topicPill: { color: colors.gold, fontWeight: '900', fontSize: 11, backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  bubbleText: { color: colors.text, lineHeight: 23, fontWeight: '800', fontSize: 15 },
});
