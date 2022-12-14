/** @jsxImportSource @emotion/react */

import {
  HeaderContainer,
  HeaderContentsWrapperDiv,
  HeaderContentWriteButton,
  HeaderShortsButtons,
} from "../../../styles/layout/header";

import Title from "./Title";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import ProfileImgWrapper from "../../profileImage";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { css } from "@emotion/react";
import CommonButton from "../../button/CommonButton";
import { useMediaQuery } from "@material-ui/core";
import { FooterShortsImg } from "../../../styles/layout/footer";
import { saveSiGuDong, saveSameLabelingReset } from "../../../store/hipMap/hipMapStore";
function Header() {
  const auth = useSelector((store: RootState) => store.userReducer.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:700px)");
  const onClick = () => {
    navigate(`/login`);
  };

  if (
    window.location.pathname === "/labeling/welcome" ||
    window.location.pathname === "/labeling/processing" ||
    window.location.pathname === "/labeling/result" ||
    window.location.pathname === "/login" ||
    window.location.pathname === "/camera"
  ) {
    return <></>;
  } else {
    return (
      <HeaderContainer>
        <div
          css={css`
            width: 100%;
            height: 100%;
            display: flex;
            max-width: 1024px;
            /* justify-content: center; */
            align-items: center;
          `}
        >
          <Title />
          {!isMobile ? (
            <HeaderContentsWrapperDiv>
              <HeaderShortsButtons
                onClick={() => {
                  navigate("/shorts");
                }}
              >
                <FooterShortsImg
                  src="/img/Shorts.png"
                  width="auto"
                  height="100%"
                  alt="shorts 버튼"
                />
              </HeaderShortsButtons>
              <HeaderShortsButtons
              onClick={() => {
                dispatch(saveSameLabelingReset())
                dispatch(saveSiGuDong(
                  {
                    si: "",
                    gu: "",
                    dong: ""
                  }
                ))
                setTimeout(() => {
                  navigate("/hipmap/fullmap");
                }, 1);
              }}>
                <FooterShortsImg
                  src="/img/randomHip.png"
                  width="auto"
                  height="100%"
                  alt="대동힙지도 버튼"
                />
              </HeaderShortsButtons>
              {auth && (
                <HeaderContentWriteButton
                  onClick={() => {
                    navigate("/write");
                  }}
                >
                  <img
                    css={css`
                      height: 5vh;
                      max-height: 40px;
                    `}
                    src="/img/largeScreenWriteButton.png"
                    alt="대동힙지도 버튼"
                  />
                </HeaderContentWriteButton>
              )}
            </HeaderContentsWrapperDiv>
          ) : null}

          <div
            css={css`
              margin-left: auto;
              width: 60%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: end;
              margin-right: 5%;
              @media (min-width: 700px) {
                font-size: 0.8rem;
                width: 35%;
                margin-right: 2%;
              }
              @media (min-width: 1024px) {
                font-size: 1.1rem;
                width: 30%;
                margin-right: 2%;
              }
              font-size: 0.6rem;
            `}
          >
            {auth ? (
              <ProfileImgWrapper />
            ) : (
              <CommonButton
                onClick={onClick}
                color="white"
                width="100px"
                height="75%"
              >
                <div>로그인</div>
              </CommonButton>
            )}
          </div>
        </div>
      </HeaderContainer>
    );
  }
}

export default Header;
