// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
import { ChainId } from '@uniswap/smart-order-router'
import { StyledFlagImage } from 'components/DonationHeader'
import Popover from 'components/Popover'
import Row, { AutoRow, RowBetween } from 'components/Row'
import { TooltipContainer } from 'components/Tooltip'
import { UKRAINE_GOV_ETH_ADDRESS } from 'constants/donations'
import useTheme from 'hooks/useTheme'
import { useState } from 'react'
import { Send } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 1.25rem;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
  width: 100%;
  padding: 16px 12px;
  background: url(image.png),
    radial-gradient(87.53% 3032.45% at 5.16% 10.13%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), #005bbb;
  border: 2px solid #ffd500;
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 4px 8px rgba(0, 0, 0, 0.04), 0px 8px 11px rgba(255, 213, 0, 0.24);
`

const RecipientBadge = styled.div`
  border-radius: 16px;
  width: fit-content;
  padding: 10px 16px;
  font-size: 14px;
  background: linear-gradient(90.9deg, rgba(21, 96, 152, 0.136) 2.37%, rgba(255, 213, 0, 0.056) 99.81%),
    rgba(255, 255, 255, 0.05);
`

export default function RecipientDetails() {
  const [showTooltip, setShowTooltip] = useState(false)

  const theme = useTheme()

  return (
    <Wrapper>
      <RowBetween>
        <AutoRow gap="md">
          <Send stroke={theme.white} size="16px" strokeWidth={'3px'} />
          <ThemedText.White ml="8px" fontWeight={700}>
            <Trans>Sending as ETH to:</Trans>
          </ThemedText.White>
        </AutoRow>
        <Popover
          show={showTooltip}
          content={
            <TooltipContainer>
              <ThemedText.Body color="text3">{UKRAINE_GOV_ETH_ADDRESS}</ThemedText.Body>
            </TooltipContainer>
          }
          placement="top"
        >
          <ExternalLink href={getExplorerLink(ChainId.MAINNET, UKRAINE_GOV_ETH_ADDRESS, ExplorerDataType.ADDRESS)}>
            <RecipientBadge onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
              <Row>
                <StyledFlagImage />
                <ThemedText.White style={{ whiteSpace: 'nowrap' }}>
                  <Trans>US-Ukraine Foundation</Trans>
                </ThemedText.White>
              </Row>
            </RecipientBadge>
          </ExternalLink>
        </Popover>
      </RowBetween>
    </Wrapper>
  )
}
