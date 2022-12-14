import { ReactEventHandler, useEffect, useRef, useState } from "react";
import { useFetchUserFollow } from "../../../hoc/useFetch";
import {
  FollowListWrapperDiv,
  FollowSearchListDiv,
  MyFollowAddButton,
  MyFollowIdWrapper,
  MyFollowListArea,
  MyFollowListDiv,
  MyFollowProfileImg,
  MyFollowProfileWrapper,
  MyFollowProfileWrapperDiv,
  MyFollowSearchAreaDiv,
  MyFollowSearchBarInput,
  MyFollowSearchBarWrapper,
  MyFollowSearchTitleDiv,
} from "../styles/MyFollowWrapperStyle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFollowAdd, useFollowDelete } from "../../../hoc/useMutation";
import { useNavigate } from "react-router-dom";
import { myFindFollows } from "./myFindFollow";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const MyFollows = ({ id, select }: { id: number; select: boolean }) => {
  const [followingSearchWord, setFollowingSearchWord] = useState<string>();
  const [followerSearchWord, setFollowerSearchWord] = useState<string>();

  const [followingList, setFollowingList] = useState<
    {
      userId: number;
      followUserName: string;
      proImgSrc: string;
    }[]
  >();
  const [followerList, setFollowerList] = useState<
    {
      userId: number;
      followUserName: string;
      proImgSrc: string;
    }[]
  >();

  const {
    data: followingData,
    isLoading: followingIsLoading,
    isError: followingIsEorror,
  } = useFetchUserFollow({
    id: id,
    fetchType: "following",
  });

  const {
    data: followerData,
    isLoading: followerIsLoading,
    isError: followerIsError,
  } = useFetchUserFollow({
    id: id,
    fetchType: "follower",
  });

  useEffect(() => {
    if (!followingIsLoading && followingData) {
      setFollowingList(followingData.follow);
    }
  }, [followingIsLoading, followingData]);

  useEffect(() => {
    if (followingSearchWord !== undefined && followingSearchWord.length > 0) {
      const result = followingData?.follow.filter((e) => {
        return e.followUserName.includes(followingSearchWord);
      });
      setFollowingList(result);
    } else if (followingData) {
      setFollowingList(followingData.follow);
    }
  }, [followingSearchWord, followingData]);

  useEffect(() => {
    if (!followerIsLoading && followerData) {
      setFollowerList(followerData.follow);
    }
  }, [followerIsLoading, followerData]);

  useEffect(() => {
    if (followerSearchWord !== undefined && followerSearchWord.length) {
      const result = followerData?.follow.filter((e) => {
        return e.followUserName.includes(followerSearchWord);
      });
      setFollowerList(result);
    } else if (followerData) {
      setFollowerList(followerData.follow);
    }
  }, [followerData, followerSearchWord]);

  const searchFollowingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowingSearchWord(e.currentTarget.value);
  };

  const searchFollowerHander = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowerSearchWord(e.currentTarget.value);
  };

  // ?????? ???????????? ???????????? ???????????? ?????? ??????.
  const [followingCrossFollower, setFollowoingCrossFollower] =
    useState<boolean[]>();
  const { mutate: followAddMutate } = useFollowAdd();
  const { mutate: followDeleteMutate } = useFollowDelete();
  const navigator = useNavigate();
  useEffect(() => {
    if (
      !followingIsLoading &&
      !followerIsLoading &&
      followingData &&
      followerData
    ) {
      setFollowoingCrossFollower(
        myFindFollows(followingData.follow, followerData.follow)
      );
    }
  }, [followingIsLoading, followerIsLoading, followingData, followerData]);
  if (followingList) {
  }

  return (
    <MyFollowListArea select={select}>
      {/* ????????? ?????? */}
      <FollowSearchListDiv>
        <MyFollowSearchBarWrapper>
          <MyFollowSearchAreaDiv>
            <MyFollowSearchTitleDiv>?????????</MyFollowSearchTitleDiv>
            <MyFollowSearchBarInput
              onChange={searchFollowingHandler}
            ></MyFollowSearchBarInput>
          </MyFollowSearchAreaDiv>
        </MyFollowSearchBarWrapper>
        {/* ????????? */}
        <FollowListWrapperDiv>
          {!followingIsLoading &&
            followingList &&
            followingList.map((e, i) => (
              <MyFollowListDiv key={i}>
                {e.proImgSrc === null ? (
                  <MyFollowProfileWrapper>
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  </MyFollowProfileWrapper>
                ) : (
                  <MyFollowProfileWrapperDiv url={e.proImgSrc} />
                )}
                <MyFollowIdWrapper
                  onClick={() => {
                    navigator("/myPage/" + e.userId);
                  }}
                >
                  {e.followUserName}
                </MyFollowIdWrapper>

                <MyFollowAddButton
                  onClick={() => {
                    followDeleteMutate(e.userId);
                  }}
                >
                  ??????
                </MyFollowAddButton>
              </MyFollowListDiv>
            ))}
        </FollowListWrapperDiv>
      </FollowSearchListDiv>
      <FollowSearchListDiv>
        <MyFollowSearchBarWrapper>
          <MyFollowSearchAreaDiv>
            <MyFollowSearchTitleDiv>?????????</MyFollowSearchTitleDiv>
            <MyFollowSearchBarInput
              onChange={searchFollowerHander}
            ></MyFollowSearchBarInput>
          </MyFollowSearchAreaDiv>
        </MyFollowSearchBarWrapper>
        {/* ????????? */}
        <FollowListWrapperDiv>
          {!followerIsLoading &&
            followerList &&
            followingData &&
            followingCrossFollower &&
            followerList.map((e, i) => (
              <MyFollowListDiv key={i}>
                {e.proImgSrc === null ? (
                  <MyFollowProfileWrapper>
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  </MyFollowProfileWrapper>
                ) : (
                  <MyFollowProfileWrapperDiv url={e.proImgSrc} />
                )}
                <MyFollowIdWrapper
                  onClick={() => {
                    navigator("/myPage/" + e.userId);
                  }}
                >
                  {e.followUserName}
                </MyFollowIdWrapper>
                <MyFollowAddButton
                  onClick={() => {
                    followAddMutate(e.userId);
                  }}
                  disabled={followingCrossFollower[i]}
                >
                  ?????????
                </MyFollowAddButton>
              </MyFollowListDiv>
            ))}
        </FollowListWrapperDiv>
      </FollowSearchListDiv>
    </MyFollowListArea>
  );
};

export default MyFollows;
