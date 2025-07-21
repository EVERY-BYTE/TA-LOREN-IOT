/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useReducer } from "react";
import { ICurrentUserModel } from "../models/userModel";

type IAppAlertTypes = {
  isDisplayAlert: boolean;
  alertType: "error" | "info" | "warning" | "success" | undefined;
  message: string;
};

export interface AppContextTypes {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  appAlert: IAppAlertTypes;
  setAppAlert: (value: IAppAlertTypes) => void;
  currentUser: ICurrentUserModel;
  setCurrentUser: (value: ICurrentUserModel) => void;
}

export enum AppAction {
  IS_LOADING = "IS_LOADING",
  APP_ALERT = "APP_ALERT",
  CURRENT_USER = "CURRENT_USER",
}

type State = {
  isLoading: boolean | unknown;
  appAlert: IAppAlertTypes | unknown;
  currentUser: ICurrentUserModel | unknown;
};

type Action = { type: AppAction; payload?: State };
type Dispatch = (action: Action) => void;

type AppContextType = {
  state: State;
  dispatch: Dispatch;
};

export const AppContext = createContext<AppContextType | any>(undefined);

function appReducer(state: State, action: Action) {
  switch (action.type) {
    case AppAction.IS_LOADING: {
      return { ...state, isLoading: action.payload?.isLoading };
    }
    case AppAction.APP_ALERT: {
      return { ...state, appAlert: action.payload?.appAlert };
    }
    case AppAction.CURRENT_USER: {
      return { ...state, currentUser: action.payload?.currentUser };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    appAlert: { isDisplayAlert: false, message: "", alertType: undefined },
    isLoading: false,
    currentUser: {},
  });

  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextTypes {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return {
    ...context,
    ...context.state,
    setIsLoading: (value: boolean) => {
      return context.dispatch({
        type: AppAction.IS_LOADING,
        payload: {
          isLoading: value,
        },
      });
    },
    setAppAlert: (value: IAppAlertTypes) => {
      return context.dispatch({
        type: AppAction.APP_ALERT,
        payload: {
          appAlert: value,
        },
      });
    },
    setCurrentUser: (value: ICurrentUserModel) => {
      return context.dispatch({
        type: AppAction.CURRENT_USER,
        payload: {
          currentUser: value,
        },
      });
    },
  };
}
