import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { STORAGE_KEYS } from "../utils/constants";
import authService from "../services/auth.service";

import {
  disconnectSocket,
} from "../socket/socket";


const AuthContext = createContext(null);


const TOKEN_KEY = STORAGE_KEYS.TOKEN;
const USER_KEY = STORAGE_KEYS.USER;


export function AuthProvider({ children }) {

  /*
  |--------------------------------------------------------------------------
  | User State
  |--------------------------------------------------------------------------
  */

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem(USER_KEY);

      return savedUser
        ? JSON.parse(savedUser)
        : null;

    } catch {

      return null;

    }

  });


  /*
  |--------------------------------------------------------------------------
  | Token State
  |--------------------------------------------------------------------------
  */

  const [token, setToken] = useState(() => {

    return localStorage.getItem(
      TOKEN_KEY
    );

  });


  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(true);


  /*
  |--------------------------------------------------------------------------
  | Authentication Status
  |--------------------------------------------------------------------------
  */

  const isAuthenticated =
    Boolean(
      token &&
      user
    );


  /*
  |--------------------------------------------------------------------------
  | Restore Authentication State
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const restoreAuth = async () => {

      try {

        const savedToken =
          localStorage.getItem(
            TOKEN_KEY
          );

        const savedUser =
          localStorage.getItem(
            USER_KEY
          );


        /*
        |--------------------------------------------------------------------------
        | No Saved Authentication
        |--------------------------------------------------------------------------
        */

        if (
          !savedToken ||
          !savedUser
        ) {

          localStorage.removeItem(
            TOKEN_KEY
          );

          localStorage.removeItem(
            USER_KEY
          );

          setToken(null);
          setUser(null);

          return;
        }


        try {

          /*
          |--------------------------------------------------------------------------
          | Parse Stored User
          |--------------------------------------------------------------------------
          */

          const storedUser =
            JSON.parse(savedUser);


          /*
          |--------------------------------------------------------------------------
          | Verify Current User From Backend
          |--------------------------------------------------------------------------
          */

          const response =
            await authService.getCurrentUser();


          /*
          |--------------------------------------------------------------------------
          | Resolve User Object
          |--------------------------------------------------------------------------
          */

          const verifiedUser =
            response?.user ||
            response?.data?.user ||
            response?.data ||
            storedUser;


          /*
          |--------------------------------------------------------------------------
          | Restore Authentication
          |--------------------------------------------------------------------------
          */

          setToken(savedToken);

          setUser(
            verifiedUser
          );


          /*
          |--------------------------------------------------------------------------
          | Keep Latest User In LocalStorage
          |--------------------------------------------------------------------------
          */

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              verifiedUser
            )
          );

        } catch {

          /*
          |--------------------------------------------------------------------------
          | Invalid / Expired Authentication
          |--------------------------------------------------------------------------
          */

          disconnectSocket();


          localStorage.removeItem(
            TOKEN_KEY
          );

          localStorage.removeItem(
            USER_KEY
          );

          setToken(null);
          setUser(null);

        }

      } finally {

        setLoading(false);

      }

    };


    restoreAuth();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  |
  | Expected:
  |
  | login({
  |   token: "...",
  |   user: {...}
  | })
  |
  |--------------------------------------------------------------------------
  */

  const login = useCallback(
    ({
      token: newToken,
      user: newUser,
    }) => {

      /*
      |--------------------------------------------------------------------------
      | Validate Token
      |--------------------------------------------------------------------------
      */

      if (!newToken) {

        throw new Error(
          "Authentication token is missing."
        );

      }


      /*
      |--------------------------------------------------------------------------
      | Save Authentication State
      |--------------------------------------------------------------------------
      */

      setToken(
        newToken
      );

      setUser(
        newUser || null
      );


      /*
      |--------------------------------------------------------------------------
      | Save Token
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        TOKEN_KEY,
        newToken
      );


      /*
      |--------------------------------------------------------------------------
      | Save User
      |--------------------------------------------------------------------------
      */

      if (newUser) {

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(
            newUser
          )
        );

      } else {

        localStorage.removeItem(
          USER_KEY
        );

      }

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Logout ke time Socket.IO connection bhi close karna zaroori hai.
  |
  | Isse:
  |
  | User A logout
  |       ↓
  | Old socket close
  |       ↓
  | Old listeners remove
  |       ↓
  | User B login / another user login
  |       ↓
  | Fresh socket
  |
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(() => {

    /*
    |--------------------------------------------------------------------------
    | Disconnect Socket First
    |--------------------------------------------------------------------------
    */

    disconnectSocket();


    /*
    |--------------------------------------------------------------------------
    | Clear Authentication State
    |--------------------------------------------------------------------------
    */

    setToken(null);

    setUser(null);


    /*
    |--------------------------------------------------------------------------
    | Clear LocalStorage
    |--------------------------------------------------------------------------
    */

    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Update Current User
  |--------------------------------------------------------------------------
  */

  const updateUser = useCallback(
    (updatedUser) => {

      setUser(
        (previousUser) => {

          const nextUser = {
            ...previousUser,
            ...updatedUser,
          };


          /*
          |--------------------------------------------------------------------------
          | Update LocalStorage
          |--------------------------------------------------------------------------
          */

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              nextUser
            )
          );


          return nextUser;

        }
      );

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Replace Complete User Object
  |--------------------------------------------------------------------------
  */

  const setCurrentUser =
    useCallback(
      (newUser) => {

        setUser(
          newUser
        );


        /*
        |--------------------------------------------------------------------------
        | Save / Remove User
        |--------------------------------------------------------------------------
        */

        if (newUser) {

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(
              newUser
            )
          );

        } else {

          localStorage.removeItem(
            USER_KEY
          );

        }

      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({

      user,

      token,

      loading,

      isAuthenticated,

      login,

      logout,

      updateUser,

      setCurrentUser,

    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
      setCurrentUser,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Provider
  |--------------------------------------------------------------------------
  */

  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

}


/*
|--------------------------------------------------------------------------
| useAuth Hook
|--------------------------------------------------------------------------
*/

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider."
    );

  }


  return context;

}


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default AuthContext;