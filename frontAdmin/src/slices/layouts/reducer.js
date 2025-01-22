import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  sidebarVisibilitytypes,
  ipData,
} from "../../Components/constants/layout";

export const initialState = {
  layoutType: layoutTypes.HORIZONTAL,
  leftSidebarType: leftSidebarTypes.LIGHT,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  preloader: preloaderTypes.DISABLE,
  sidebarVisibilitytype: sidebarVisibilitytypes.SHOW,
  ipData:ipData,
  personalChatUnseenCounts: [],
  groupChatUnseenCounts: [],
  totalUnseenCount: 0,
  currentOtherUser: null,
  userStatuses: {},
  userData: null,
  tableColumnConfig:[],
  configDataLoading: true,
  departmentUserInfo:{}
};

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state, action) {
      state.layoutType = action.payload;
    },
    changeLayoutModeAction(state, action) {
      state.layoutModeType = action.payload;
    },
    changeSidebarThemeAction(state, action) {
      state.leftSidebarType = action.payload;
    },
    changeLayoutWidthAction(state, action) {
      state.layoutWidthType = action.payload;
    },
    changeLayoutPositionAction(state, action) {
      state.layoutPositionType = action.payload;
    },
    changeTopbarThemeAction(state, action) {
      state.topbarThemeType = action.payload;
    },
    changeLeftsidebarSizeTypeAction(state, action) {
      state.leftsidbarSizeType = action.payload;
    },
    changeLeftsidebarViewTypeAction(state, action) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state, action) {
      state.leftSidebarImageType = action.payload;
    },
    changePreLoaderAction(state, action) {
      state.preloader = action.payload;
    },
    changeSidebarVisibilityAction(state, action) {
      state.sidebarVisibilitytype = action.payload;
    },
    setIPdataAction(state,action){
      state.ipData = action.payload;
    },
    setPersonalChatUnseenCountsAction(state,action){
      state.personalChatUnseenCounts = action.payload;
    },
    setGroupChatUnseenCountsAction(state,action){
      state.groupChatUnseenCounts = action.payload;
    },
    setCurrentOtherUserAction(state,action){
      state.currentOtherUser = action.payload;
    },
    setUserStatusesAction(state,action){
      state.userStatuses = action.payload;
    },
    setUserDataAction(state,action){
      state.userData = action.payload;
    },
    setTotalUnseenCountAction(state,action){
      state.totalUnseenCount = action.payload;
    },
    setTableColumnConfig(state,action){
      state.tableColumnConfig = action.payload;
    },
    setTableConfigDataLoading(state,action){
      state.configDataLoading = action.payload;
    },
    setDepartmentUserInfo(state,action){
      state.departmentUserInfo = action.payload;
    },
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changePreLoaderAction,
  changeSidebarVisibilityAction,
  setIPdataAction,
  setPersonalChatUnseenCountsAction,
  setGroupChatUnseenCountsAction,
  setUserDataAction,
  setUserStatusesAction,
  setCurrentOtherUserAction,
  setTotalUnseenCountAction,
  setTableColumnConfig,
  setTableConfigDataLoading,
  setDepartmentUserInfo
} = LayoutSlice.actions;

export default LayoutSlice.reducer;