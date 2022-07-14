import React, { forwardRef, ReactElement, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, LayoutChangeEvent, TextInput as NativeTextInput, ViewStyle } from 'react-native'
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { useAppTheme } from 'src/app/hooks'
import X from 'src/assets/icons/x.svg'
import { BackButton } from 'src/components/buttons/BackButton'
import { AnimatedButton } from 'src/components/buttons/Button'
import { IconButton } from 'src/components/buttons/IconButton'
import { TextInput } from 'src/components/input/TextInput'
import { AnimatedFlex, Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { dimensions } from 'src/styles/sizing'
import { Theme } from 'src/styles/theme'
import SearchIcon from '../../assets/icons/search.svg'

export const springConfig = {
  stiffness: 1000,
  damping: 500,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
}

export interface SearchTextInputProps {
  value: string | null
  onChangeText: (newText: string) => void
  onFocus?: () => void
  onCancel?: () => void
  backgroundColor?: keyof Theme['colors']
  clearIcon?: ReactElement
  disableClearable?: boolean
  endAdornment?: ReactElement
  placeholder?: string
  showBackButton?: boolean
}

export const SearchTextInput = forwardRef<NativeTextInput, SearchTextInputProps>((props, ref) => {
  const theme = useAppTheme()
  const { t } = useTranslation()
  const {
    backgroundColor = 'backgroundSurface',
    clearIcon,
    disableClearable,
    endAdornment = (
      <SearchIcon color={theme.colors.textTertiary} height={20} strokeWidth={2} width={20} />
    ),
    onCancel,
    onChangeText,
    onFocus,
    placeholder,
    showBackButton,
    value,
  } = props

  const isFocus = useSharedValue(false)
  const showClearButton = useSharedValue((value?.length as number) > 0 && !disableClearable)
  const cancelButtonWidth = useSharedValue(40)

  const onPressCancel = () => {
    isFocus.value = false
    Keyboard.dismiss()
    onChangeText?.('')
    onCancel?.()
  }

  const onCancelLayout = useCallback(
    (event: LayoutChangeEvent) => {
      cancelButtonWidth.value = event.nativeEvent.layout.width
    },
    [cancelButtonWidth]
  )

  const onClear = () => {
    onChangeText?.('')
    showClearButton.value = false
  }

  const onTextInputFocus = () => {
    isFocus.value = true
    onFocus?.()
  }

  const onTextInputSubmitEditing = () => {
    Keyboard.dismiss()
  }

  const onChangeTextInput = useCallback(
    (text: string) => {
      onChangeText?.(text)
      if (text.length > 0) {
        showClearButton.value = true
      } else {
        showClearButton.value = false
      }
    },
    [showClearButton, onChangeText]
  )

  const textInputStyle = useAnimatedStyle(() => {
    return {
      marginRight: withSpring(isFocus.value ? cancelButtonWidth.value + 10 : 0, springConfig),
    }
  })

  const clearButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocus.value && showClearButton.value ? 1 : 0),
      transform: [{ scale: withTiming(isFocus.value && showClearButton.value ? 1 : 0) }],
    }
  })

  const endAdornmentStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocus.value && showClearButton.value ? 0 : 1),
      transform: [{ scale: withTiming(isFocus.value && showClearButton.value ? 0 : 1) }],
    }
  })

  const cancelButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocus.value ? 1 : 0),
      transform: [
        { scale: withTiming(isFocus.value ? 1 : 0) },
        {
          translateX: isFocus.value
            ? withTiming(0, { duration: 0 })
            : withTiming(dimensions.fullWidth, { duration: 650 }),
        },
      ],
    }
  })

  return (
    <Flex centered row gap="none">
      {showBackButton && <BackButton pr="sm" />}
      <AnimatedFlex
        row
        alignItems="center"
        backgroundColor={backgroundColor}
        borderRadius="lg"
        flex={1}
        flexGrow={1}
        gap="none"
        minHeight={48}
        style={textInputStyle}>
        <TextInput
          ref={ref}
          autoCapitalize="none"
          autoCorrect={false}
          backgroundColor="none"
          borderWidth={0}
          flex={1}
          fontSize={16}
          fontWeight="500"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          returnKeyType="done"
          textContentType="none"
          value={value ?? undefined}
          onChangeText={onChangeTextInput}
          onFocus={onTextInputFocus}
          onSubmitEditing={onTextInputSubmitEditing}
        />
        {showClearButton.value ? (
          <AnimatedFlex mx="sm" style={[clearButtonStyle]}>
            <ClearButton clearIcon={clearIcon} onPress={onClear} />
          </AnimatedFlex>
        ) : (
          <AnimatedFlex mx="sm" style={[endAdornmentStyle]}>
            {endAdornment}
          </AnimatedFlex>
        )}
      </AnimatedFlex>
      <AnimatedButton
        style={[cancelButtonStyle, CancelButtonDefaultStyle]}
        onLayout={onCancelLayout}
        onPress={onPressCancel}>
        <Text variant={'subhead'}>{t('Cancel')}</Text>
      </AnimatedButton>
    </Flex>
  )
})

const CancelButtonDefaultStyle: ViewStyle = {
  position: 'absolute',
  right: 0,
}

interface ClearButtonProps {
  clearIcon: SearchTextInputProps['clearIcon']
  onPress: () => void
}

function ClearButton(props: ClearButtonProps) {
  const theme = useAppTheme()

  const {
    onPress,
    clearIcon = <X color={theme.colors.textSecondary} height={10} strokeWidth={4} width={10} />,
  } = props

  return (
    <IconButton
      bg="backgroundSurface"
      borderRadius="full"
      icon={clearIcon}
      p="xs"
      onPress={onPress}
    />
  )
}
