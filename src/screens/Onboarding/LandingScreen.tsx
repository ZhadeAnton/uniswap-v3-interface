import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, View } from 'react-native'
import { useAppDispatch } from 'src/app/hooks'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import { UNISWAP_SPLASH_LOGO } from 'src/assets'
import WalletIcon from 'src/assets/icons/wallet.svg'
import { Button } from 'src/components/buttons/Button'
import {
  RainbowLinearGradientStops,
  usePrimaryToSecondaryLinearGradient,
} from 'src/components/gradients'
import { LinearGradientBox } from 'src/components/gradients/LinearGradient'
import { Chevron } from 'src/components/icons/Chevron'
import { Box, Flex } from 'src/components/layout'
import { Screen } from 'src/components/layout/Screen'
import { Text } from 'src/components/Text'
import { ElementName } from 'src/features/telemetry/constants'
import { setFinishedOnboarding } from 'src/features/wallet/walletSlice'
import { OnboardingScreens } from 'src/screens/Screens'
import { theme } from 'src/styles/theme'

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.Landing>

export function LandingScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()

  const { t } = useTranslation()

  const gradientStops = usePrimaryToSecondaryLinearGradient()

  const onPressCreateWallet = () => {
    navigation.navigate(OnboardingScreens.CreateWallet)
  }

  const onPressImportWallet = () => {
    // TODO Implement import wallet flow
    dispatch(setFinishedOnboarding({ finishedOnboarding: true }))
  }

  const onPressExplore = () => {
    // TODO Build any tooltips/guides for "explore"
    dispatch(setFinishedOnboarding({ finishedOnboarding: true }))
  }

  return (
    <Screen edges={['bottom']}>
      <LinearGradientBox opacity={0.1} stops={gradientStops} />
      <Box flex={1} justifyContent={'flex-end'}>
        <Box alignItems="center" flex={1} justifyContent={'center'}>
          <Box>
            <LinearGradientBox radius="lg" stops={RainbowLinearGradientStops}>
              <View style={styles.padded}>
                <Box bg="black" borderRadius="lg">
                  <Image source={UNISWAP_SPLASH_LOGO} />
                </Box>
              </View>
            </LinearGradientBox>
          </Box>
        </Box>
        <Flex gap="sm" mx="md" my="sm">
          <Button name={ElementName.OnboardingCreateWallet} onPress={onPressCreateWallet}>
            <Flex
              row
              alignItems="center"
              bg="black"
              borderColor="gray100"
              borderRadius="md"
              borderWidth={1}
              gap="sm"
              px="lg"
              py="md">
              <WalletIcon fill={theme.colors.purple} height={15} width={15} />
              <Text color="white" variant="h5">
                {t('Create a Wallet')}
              </Text>
            </Flex>
          </Button>
          <Button
            name={ElementName.OnboardingImportWallet}
            testID={ElementName.OnboardingImportWallet}
            onPress={onPressImportWallet}>
            <Flex
              row
              alignItems="center"
              bg="black"
              borderColor="gray100"
              borderRadius="md"
              borderWidth={1}
              gap="sm"
              px="lg"
              py="md">
              <Chevron color={theme.colors.purple} direction="s" height={15} width={15} />
              <Text color="white" variant="h5">
                {t('I Already Have a Wallet')}
              </Text>
            </Flex>
          </Button>

          <Button
            flexDirection="row"
            justifyContent="center"
            name={ElementName.OnboardingExplore}
            pt="sm"
            onPress={onPressExplore}>
            <Text variant="bodySm">{t('Not ready? Try')}</Text>
            <Text color="purple" variant="bodySm">
              {' '}
              {t('Exploring')}{' '}
            </Text>
            <Text variant="bodySm">{t('first.')}</Text>
          </Button>
        </Flex>
      </Box>
    </Screen>
  )
}

const styles = StyleSheet.create({
  padded: { padding: 1 },
})
