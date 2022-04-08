import React, { useCallback, useState, useImperativeHandle, useEffect } from "react";
import styled from "styled-components";
import HelpIcon from "../../assets/imgs/help-icon.png";
import HarvestIcon from "../../assets/imgs/harvest.png";
import WithdrawIcon from "../../assets/imgs/withdraw.png";
import { useTranslation } from "react-i18next";
import { SC } from '../../SmartContracts';
import bigInt from "big-integer";


const StyledStakeItemContainer = styled.div`
  z-index: 10;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 32px;
  color: #fff;
  box-sizing: border-box;
  padding: 32px;
  @media (max-width: 600px) {
    min-width: auto !important;
    padding: 12px;
  }
`;

const StyledStakeItemHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 24px;
  line-height: 29px;
  letter-spacing: 0.02em;
  color: #ffffff;
  p {
    margin-right: 10px;
  }
`;

const StyledStakeItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  p {
    font-weight: 500;
    font-size: 20px;
    line-height: 140%;
    letter-spacing: 0.02em;
    color: #ffffff;
  }
  span {
    color: #c2abcb;
    font-weight: 500;
    font-size: 20px;
    line-height: 140%;
    letter-spacing: 0.02em;
  }
`;

const StyledStakeItemRowWithButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  gap: 20px;
`;

const StyledStakeItemButton = styled.a`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 21px 25px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 50.1%,
    rgba(255, 255, 255, 0.2) 100%
  );
  background-size: 200%;
  border-radius: 12px;
  min-width: 200px;
  text-align: center;
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
  letter-spacing: 0.02em;
  color: #ffffff;
  transition-duration: 0.2s;
  ${(props) =>
        props.activeButton &&
        "background: linear-gradient(83.53deg, #B114FF 0, #B114FF 24.77%, #FF1493 100.89%);"}
  ${(props) =>
        props.activeButton &&
        "&:hover { background-position: left center; background-size: 200%;}"}
    
  img {
    margin-left: 12px;
  }
  &:hover {
    background-position: right center;
  }
`;

const StyledStakeItemTextWithButton = styled.div`
  display: flex;
  flex-direction: column;
  span {
    color: #c2abcb;
    font-weight: 500;
    font-size: 20px;
    line-height: 140%;
    letter-spacing: 0.02em;
  }
  p {
    font-weight: 700;
    font-size: 24px;
    line-height: 29px;
    letter-spacing: 0.02em;
    color: #ffffff;
  }
  @media (max-width: 600px) {
    p {
    font-size: 18px;
    }
  }
`;
const StyledAPR = styled.div`
  display: flex;
  align-items: center;
  span {
    margin-right: 6px;
  }
`;

const StyledStakeItemAccountId = styled.div`
  margin-top: 25px;
  opacity: .5;
  padding: 5px;
  padding-left: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, .2);
  border-radius: 7px;
`;
const StyledStakeItemHelp = styled.span`
.i {
  position: relative;
  top: 2px;
}
.i .tooltip {
  display: none;
  background: #000;
  border-radius: 4px;
  color: #fff;
  padding: 4px 4px 6px;
  font-size: 12px;
  line-height: 130%;
  position: absolute;
  left: calc(50% - 234px/2);
  bottom: 38px;
  width: 234px;
  box-sizing: border-box;
  text-align: center;
  }
  .i .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url(22.svg);
    vertical-align: top;
    margin-top: 3px;
}
.i:hover   .tooltip {display: block;}
.i .tooltip:before{position:absolute;content:'';left:calc(50% - 4px);bottom:-4px;width:8px;height:4px;background-image: url("data:image/svg+xml,%3Csvg width='8' height='4' viewBox='0 0 8 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.01107 4L8 0H0L4.01107 4Z' fill='black'/%3E%3C/svg%3E%0A");}
`;


export const StakeItem = ({
    version,
    earnedText,
    activeButton,
    onUseConnection,
    account,
    onStake,
    needToApprove,
    provider
}, ref) => {
    let [ APR, setAPR ] = useState(0);
    let [ initialized, setInitialized ] = useState(false);
    let [ approved, setApproved ] = useState(false);
    let [ earned, setEarned ] = useState('-');
    let [ inStake, setInStake ]  = useState('-');
    let [ canHarvest, setCanHarvest ] = useState(false);
    let [ canWithdraw, setCanWithdraw ] = useState(false);
    let [ unlockedReward, setUnlockedReward ] = useState(0);

    const { t } = useTranslation();

    const handleUseConnection = useCallback(() => {
        onUseConnection();
    }, [ onUseConnection ]);

    const handleStake = useCallback(() => {
        onStake();
    }, [ onStake ])
  
    const harvest = useCallback(async () => {
        if (version === "1") {
          await SC.harvest(account);
        } else if (version === "2") {
          await SC.harvestV2(account);
        }
    }, [ version, account ]);

    const withdraw = useCallback(async () => {
        if (version === "1") {
          await SC.withdraw(account, SC.inStake);
        } else if (version === "2") {
          await SC.withdrawV2(account, SC.inStakeV2);
        }
    }, [ version, account ]);
    const updateData = useCallback(async () => {
      let inStakeRaw, earnedRaw, holdingTimeRaw, stackedTimeRaw,unlockReward,inStakeRawV2;
      if (version === "1") {
          inStakeRaw = await SC.getInStake(account);
          earnedRaw = await SC.getEarned(account);
          holdingTimeRaw =  await SC.getInHoldTime();
          stackedTimeRaw = await SC.getInStackTime(account);
          setInStake(inStakeRaw);
          setEarned(earnedRaw);
      } else if (version === "2") {
           unlockReward = await SC.getUnlockedRewardV2(account);
           inStakeRawV2 = await SC.getInStakeV2(account);
           earnedRaw = await SC.getEarnedV2(account);
           setInStake(inStakeRawV2);
           setEarned(earnedRaw.toFixed(2));
           setUnlockedReward(unlockReward);
      }
       
        if(version === "1") {
          setCanHarvest(true);
          setCanWithdraw(!(parseInt(inStakeRaw) <= 0) && holdingTimeRaw >= (parseInt(Date.now()) - stackedTimeRaw));
        }
        else if(version === "2") {
          setCanHarvest(unlockReward > 0);
          setCanWithdraw(!(parseInt(inStakeRawV2) <= 0));
        }

    }, [ account, version, inStake ]);

    const approve = useCallback(async () => {
        let approval;
        if (version === "1") {
            approval = await SC.approve();
        } else if (version === "2") {
            approval = await SC.approveV2();
        }

        setApproved(approval);

        updateData();
    }, [ version, updateData ]);

    useEffect(() => {
        (async () => {
            if (account && !approved) {
                if (version === "1") {
                    if (await SC.allowance(account)) return setApproved(true);
                } else if (version === "2") {
                    if (await SC.allowanceV2(account)) return setApproved(true);
                }
            }
            if (!initialized && approved) {
                if (version === "1") {
                    setAPR(await SC.APR());
                } else if (version === "2") {
                    setAPR(await SC.APRV2());
                }
                setInitialized(true);
                
                setInterval(() => {
                    updateData();
                }, 1000);
            }
        })();
    }, [
        initialized,
        setInitialized,
        updateData,
        account, earned, version,
        approved,
        setAPR
    ]);

    return (
        <StyledStakeItemContainer>
            { version === "1" ? <StyledStakeItemHeader>
                <p>
                    {t("STAKE.STAKE_TITLE1")}
                </p>
                <StyledStakeItemHelp>
                <span class="i">
                      <img src={HelpIcon} alt="" />
			                <span class="tooltip">			
                      Your deposit will be locked for 30 days. However, the rewards will always be available for withdrawal.
		          	</span>
              	</span>
                </StyledStakeItemHelp>
            </StyledStakeItemHeader> : version == "2" ? <StyledStakeItemHeader>
                <p>
                    {t("STAKE.STAKE_TITLE2")}
                </p>
                <StyledStakeItemHelp>
                <span class="i">
                      <img src={HelpIcon} alt="" />
			                <span class="tooltip">			
                      Your deposit is always available for withdrawal. However, the rewards will start unlocking after 30 days.
		          	</span>
              	</span>
                </StyledStakeItemHelp>
            </StyledStakeItemHeader> : null}
            <StyledStakeItemRow>
                <StyledAPR>
                    <span> {t("STAKE.APR")}</span>
                    <StyledStakeItemHelp>
                     <span class="i">
                      <img src={HelpIcon} alt="" />
			                <span class="tooltip">			
                       APR is not fixed and can change constantly
		          	</span>
              	</span>
                </StyledStakeItemHelp>
                </StyledAPR>
                <p>{ APR ? `${APR}%` : '-' }</p>
            </StyledStakeItemRow>
            { version === "2" ? <StyledStakeItemRow>
                <span> {t("STAKE.EARNED")}</span>
                <p>
                    {earnedText}
                </p>
            </StyledStakeItemRow> : null }
            { version === "2" ? <StyledStakeItemRow>
                <span> Unlocked Reward </span>
                <p>{ unlockedReward }</p>
            </StyledStakeItemRow> : null }
            <StyledStakeItemRowWithButton>
                <StyledStakeItemTextWithButton>
                    <span>
                        {earnedText} {t("STAKE.EARNED")}
                    </span>
                    <p>{ earned }</p>
                </StyledStakeItemTextWithButton>

                <StyledStakeItemButton activeButton={ approved && canHarvest } onClick={ approved && canHarvest ? harvest : () => {} }>
                    {t("STAKE.HARVEST")} <img src={HarvestIcon} alt="" />
                </StyledStakeItemButton>
            </StyledStakeItemRowWithButton>
            <StyledStakeItemRowWithButton>
                <StyledStakeItemTextWithButton>
                    <span>METO {t("STAKE.INSTAKE")}</span>
                    <p>{ inStake }</p>
                </StyledStakeItemTextWithButton>

                <StyledStakeItemButton activeButton={ approved && canWithdraw} onClick={ approved && canWithdraw ? withdraw : () => {} }>
                    {(activeButton && `${t("STAKE.STAKE")} METO`) ||
                        `${t("STAKE.WITHDRAW")}`}{" "}
                    <img src={WithdrawIcon} alt="" />
                </StyledStakeItemButton>
            </StyledStakeItemRowWithButton>
            <StyledStakeItemRowWithButton>
                <StyledStakeItemButton onClick={ approved ? handleStake : () => {} } activeButton={ approved } style={{ width: '100%' }}>
                    Stake
                </StyledStakeItemButton>
            </StyledStakeItemRowWithButton>
            <StyledStakeItemRowWithButton>
                <StyledStakeItemButton onClick={ needToApprove ? (!approved ? approve : () => {}) : handleUseConnection } activeButton={ !approved } style={{ width: '100%' }}>
                    { needToApprove ? (approved ? 'Approved' : 'Approve') : 'Connect Wallet' }
                    <img src={WithdrawIcon} alt="" />
                </StyledStakeItemButton>
            </StyledStakeItemRowWithButton>
            { account ? 
                <StyledStakeItemAccountId>Connected as { `${account.slice(0, 6)}...${account.slice(38, 42)}` }</StyledStakeItemAccountId>
                : null
            }
        </StyledStakeItemContainer>
    );
};
