import { AnyAction } from '@reduxjs/toolkit'
import { providers } from 'ethers'
import React, { Dispatch, ReactElement, useCallback, useEffect } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Button, ButtonEmphasis, ButtonSize } from 'src/components/buttons/Button'
import { AnimatedFlex, Flex } from 'src/components/layout'
import { Warning } from 'src/components/modals/WarningModal/types'
import { Text } from 'src/components/Text'
import { DerivedSwapInfo, useSwapActionHandlers } from 'src/features/transactions/swap/hooks'
import { SwapForm } from 'src/features/transactions/swap/SwapForm'
import { SwapReview } from 'src/features/transactions/swap/SwapReview'
import { SwapStatus } from 'src/features/transactions/swap/SwapStatus'
import { DerivedTransferInfo } from 'src/features/transactions/transfer/hooks'
import { TransferReview } from 'src/features/transactions/transfer/TransferReview'
import { TransferStatus } from 'src/features/transactions/transfer/TransferStatus'
import { TransferTokenForm } from 'src/features/transactions/transfer/TransferTokenForm'
import { ANIMATE_SPRING_CONFIG } from 'src/features/transactions/utils'
import { dimensions } from 'src/styles/sizing'

export enum TransactionStep {
  FORM,
  REVIEW,
  SUBMITTED,
}

interface TransactionFlowProps {
  dispatch: Dispatch<AnyAction> // TODO: remove when gas endpoint work lands
  showTokenSelector: boolean
  showRecipientSelector?: boolean
  tokenSelector: ReactElement
  recipientSelector?: ReactElement
  flowName: string
  derivedInfo: DerivedTransferInfo | DerivedSwapInfo
  onClose: () => void
  approveTxRequest?: providers.TransactionRequest
  txRequest?: providers.TransactionRequest
  totalGasFee?: string
  step: TransactionStep
  setStep: (newStep: TransactionStep) => void
  warnings: Warning[]
  exactValue: string
  isUSDInput?: boolean
  showUSDToggle?: boolean
}

type InnerContentProps = Pick<
  TransactionFlowProps,
  | 'derivedInfo'
  | 'onClose'
  | 'dispatch'
  | 'totalGasFee'
  | 'txRequest'
  | 'approveTxRequest'
  | 'warnings'
  | 'exactValue'
> & {
  step: number
  setStep: (step: TransactionStep) => void
}

function isSwapInfo(
  derivedInfo: DerivedTransferInfo | DerivedSwapInfo
): derivedInfo is DerivedSwapInfo {
  return (derivedInfo as DerivedSwapInfo).trade !== undefined
}

export function TransactionFlow({
  flowName,
  showTokenSelector,
  showRecipientSelector,
  tokenSelector,
  recipientSelector,
  derivedInfo,
  approveTxRequest,
  txRequest,
  totalGasFee,
  step,
  setStep,
  onClose,
  dispatch,
  warnings,
  exactValue,
  isUSDInput,
  showUSDToggle,
}: TransactionFlowProps) {
  // enable tap to dismiss keyboard on whole modal screen
  // this only applies when we show native keyboard on smaller devices
  const onBackgroundPress = () => {
    Keyboard.dismiss()
  }

  const screenXOffset = useSharedValue(0)
  useEffect(() => {
    const screenOffset = showTokenSelector || showRecipientSelector ? 1 : 0
    screenXOffset.value = withSpring(-(dimensions.fullWidth * screenOffset), ANIMATE_SPRING_CONFIG)
  }, [screenXOffset, showTokenSelector, showRecipientSelector])

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenXOffset.value }],
  }))

  const { onToggleUSDInput } = useSwapActionHandlers(dispatch)

  return (
    <TouchableWithoutFeedback onPress={onBackgroundPress}>
      <AnimatedFlex grow row gap="none" height="100%" paddingBottom="xl" style={wrapperStyle}>
        <Flex gap="xs" px="md" width="100%">
          {step !== TransactionStep.SUBMITTED && (
            <Flex row alignItems="center" justifyContent="space-between" px="sm">
              <Text py="xs" textAlign="left" variant="subheadLarge">
                {flowName}
              </Text>
              {step === TransactionStep.FORM && showUSDToggle && (
                <Button
                  emphasis={ButtonEmphasis.Tertiary}
                  label="$   USD"
                  name="toggle-usd"
                  size={ButtonSize.Small}
                  onPress={() => onToggleUSDInput(!isUSDInput)}
                />
              )}
            </Flex>
          )}
          <InnerContentRouter
            approveTxRequest={approveTxRequest}
            derivedInfo={derivedInfo}
            dispatch={dispatch}
            exactValue={exactValue}
            setStep={setStep}
            step={step}
            totalGasFee={totalGasFee}
            txRequest={txRequest}
            warnings={warnings}
            onClose={onClose}
          />
        </Flex>
        {showTokenSelector ? tokenSelector : null}
        {showRecipientSelector && recipientSelector ? recipientSelector : null}
      </AnimatedFlex>
    </TouchableWithoutFeedback>
  )
}

function InnerContentRouter(props: InnerContentProps) {
  const { derivedInfo, setStep } = props
  const onFormNext = useCallback(() => setStep(TransactionStep.REVIEW), [setStep])
  const onReviewNext = useCallback(() => setStep(TransactionStep.SUBMITTED), [setStep])
  const onReviewPrev = useCallback(() => setStep(TransactionStep.FORM), [setStep])
  const onRetrySubmit = useCallback(() => setStep(TransactionStep.FORM), [setStep])

  const isSwap = isSwapInfo(derivedInfo)
  if (isSwap)
    return (
      <SwapInnerContent
        derivedSwapInfo={derivedInfo}
        onFormNext={onFormNext}
        onRetrySubmit={onRetrySubmit}
        onReviewNext={onReviewNext}
        onReviewPrev={onReviewPrev}
        {...props}
      />
    )
  return (
    <TransferInnerContent
      derivedTransferInfo={derivedInfo}
      onFormNext={onFormNext}
      onRetrySubmit={onRetrySubmit}
      onReviewNext={onReviewNext}
      onReviewPrev={onReviewPrev}
      {...props}
    />
  )
}

interface SwapInnerContentProps extends InnerContentProps {
  derivedSwapInfo: DerivedSwapInfo
  onFormNext: () => void
  onReviewNext: () => void
  onReviewPrev: () => void
  onRetrySubmit: () => void
}

function SwapInnerContent({
  derivedSwapInfo,
  onClose,
  dispatch,
  totalGasFee,
  approveTxRequest,
  txRequest,
  warnings,
  onFormNext,
  onReviewNext,
  onReviewPrev,
  onRetrySubmit,
  step,
  exactValue,
}: SwapInnerContentProps) {
  switch (step) {
    case TransactionStep.SUBMITTED:
      return (
        <SwapStatus derivedSwapInfo={derivedSwapInfo} onNext={onClose} onTryAgain={onRetrySubmit} />
      )

    case TransactionStep.FORM:
      return (
        <SwapForm
          derivedSwapInfo={derivedSwapInfo}
          dispatch={dispatch}
          exactValue={exactValue}
          warnings={warnings}
          onNext={onFormNext}
        />
      )
    case TransactionStep.REVIEW:
      return (
        <SwapReview
          approveTxRequest={approveTxRequest}
          derivedSwapInfo={derivedSwapInfo}
          exactValue={exactValue}
          totalGasFee={totalGasFee}
          txRequest={txRequest}
          warnings={warnings}
          onNext={onReviewNext}
          onPrev={onReviewPrev}
        />
      )
    default:
      return null
  }
}

interface TransferInnerContentProps extends InnerContentProps {
  derivedTransferInfo: DerivedTransferInfo
  onFormNext: () => void
  onReviewNext: () => void
  onReviewPrev: () => void
  onRetrySubmit: () => void
}

function TransferInnerContent({
  derivedTransferInfo,
  onClose,
  dispatch,
  step,
  totalGasFee,
  txRequest,
  warnings,
  onFormNext,
  onRetrySubmit,
  onReviewNext,
  onReviewPrev,
}: TransferInnerContentProps) {
  switch (step) {
    case TransactionStep.SUBMITTED:
      return (
        <TransferStatus
          derivedTransferInfo={derivedTransferInfo}
          onNext={onClose}
          onTryAgain={onRetrySubmit}
        />
      )
    case TransactionStep.FORM:
      return (
        <TransferTokenForm
          derivedTransferInfo={derivedTransferInfo}
          dispatch={dispatch}
          warnings={warnings}
          onNext={onFormNext}
        />
      )
    case TransactionStep.REVIEW:
      return (
        <TransferReview
          derivedTransferInfo={derivedTransferInfo}
          totalGasFee={totalGasFee}
          txRequest={txRequest}
          warnings={warnings}
          onNext={onReviewNext}
          onPrev={onReviewPrev}
        />
      )
    default:
      return null
  }
}
