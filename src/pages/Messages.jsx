import React, { 
  useCallback, 
  useEffect, 
  useRef, 
  useState, 
} from "react"; 
 
import { 
  useLocation, 
  useNavigate, 
} from "react-router-dom"; 
 
import ConversationList from "../components/message/ConversationList"; 
import MessageHeader from "../components/message/MessageHeader"; 
import MessageList from "../components/message/MessageList"; 
import MessageInput from "../components/message/MessageInput"; 
import EmptyChat from "../components/message/EmptyChat"; 
 
import useMessages from "../hooks/useMessages"; 
import useAuth from "../hooks/useAuth"; 
import userService from "../services/user.service"; 
 
import { 
  useGlobalCall, 
} from "../components/call/GlobalCallManager"; 
 
import { 
  markConversationRead, 
} from "../socket/socket"; 
 
import "../App.css"; 
 
 
/* 
|-------------------------------------------------------------------------- 
| Generate Call ID 
|-------------------------------------------------------------------------- 
*/ 
 
const generateCallId = () => { 
 
  if ( 
    typeof crypto !== "undefined" && 
    typeof crypto.randomUUID === "function" 
  ) { 
    return crypto.randomUUID(); 
  } 
 
  return `call-${Date.now()}-${Math.random() 
    .toString(36) 
    .slice(2, 10)}`; 
}; 
 
 
/* 
|-------------------------------------------------------------------------- 
| Messages 
|-------------------------------------------------------------------------- 
*/ 
 
const Messages = () => { 
 
  const location = useLocation(); 
  const navigate = useNavigate(); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | AUTH 
  |-------------------------------------------------------------------------- 
  */ 
 
  const { 
    user: currentUser, 
  } = useAuth(); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | GLOBAL CALL 
  |-------------------------------------------------------------------------- 
  */ 
 
  const { 
    startCall, 
    callError, 
  } = useGlobalCall(); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Selected Conversation 
  |-------------------------------------------------------------------------- 
  */ 
 
  const [ 
    selectedConversation, 
    setSelectedConversation, 
  ] = useState(null); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Reply Message 
  |-------------------------------------------------------------------------- 
  | 
  | Jab user kisi message ke Reply button par click karega, 
  | selected message yahan store hoga. 
  | 
  */ 
 
  const [ 
    replyMessage, 
    setReplyMessage, 
  ] = useState(null); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Input Message 
  |-------------------------------------------------------------------------- 
  | 
  | MessageInput ko controlled banaya gaya hai. 
  | 
  | Reply click: 
  | 
  | original message text 
  |        ↓ 
  | inputMessage 
  |        ↓ 
  | MessageInput 
  |        ↓ 
  | text automatically selected 
  | 
  */ 
 
  const [ 
    inputMessage, 
    setInputMessage, 
  ] = useState(""); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Reply Selection Trigger 
  |-------------------------------------------------------------------------- 
  | 
  | Har Reply click par number increase hoga. 
  | 
  | Isse MessageInput ko pata chalega ki input ko 
  | dobara select karna hai. 
  | 
  */ 
 
  const [ 
    replySelectVersion, 
    setReplySelectVersion, 
  ] = useState(0); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Opening User 
  |-------------------------------------------------------------------------- 
  */ 
 
  const [ 
    openingUser, 
    setOpeningUser, 
  ] = useState(false); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Prevent Duplicate URL Processing 
  |-------------------------------------------------------------------------- 
  */ 
 
  const processedTargetRef = 
    useRef(""); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Conversation ID 
  |-------------------------------------------------------------------------- 
  */ 
 
  const conversationId = 
    selectedConversation?._id || 
    selectedConversation?.id || 
    null; 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | Messaging Hook 
  |-------------------------------------------------------------------------- 
  */ 
 
  const { 
    conversations, 
    messages, 
    loadingMessages, 
    sending, 
    error, 
    createConversation, 
    sendMessage, 
    markAsRead, 
    deleteMessage, 
    updateMessage, 
  } = useMessages(conversationId); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | SELECT EXISTING CONVERSATION 
  |-------------------------------------------------------------------------- 
  */ 
 
  const handleSelectConversation = 
    useCallback( 
      (conversation) => { 
 
        if (!conversation) { 
          return; 
        } 
 
        /* 
         * Previous reply clear 
         */ 
        setReplyMessage(null); 
 
        /* 
         * Previous input clear 
         */ 
        setInputMessage(""); 
 
        /* 
         * Selection trigger reset 
         */ 
        setReplySelectVersion(0); 
 
        setSelectedConversation( 
          conversation 
        ); 
 
        if (location.search) { 
          navigate("/messages", { 
            replace: true, 
          }); 
        } 
      }, 
      [ 
        location.search, 
        navigate, 
      ] 
    ); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | OPEN USER FROM URL 
  |-------------------------------------------------------------------------- 
  */ 
 
  useEffect(() => { 
 
    const params = 
      new URLSearchParams( 
        location.search 
      ); 
 
    const username = 
      params.get("user"); 
 
    const userId = 
      params.get("userId"); 
 
 
    if (!username && !userId) { 
      return; 
    } 
 
 
    const targetKey = 
      userId || 
      username 
        ?.replace("@", "") 
        .trim() 
        .toLowerCase(); 
 
 
    if ( 
      !targetKey || 
      processedTargetRef.current === 
        targetKey 
    ) { 
      return; 
    } 
 
 
    processedTargetRef.current = 
      targetKey; 
 
 
    let cancelled = false; 
 
 
    const openUserConversation = 
      async () => { 
 
        try { 
 
          setOpeningUser(true); 
 
 
          let targetUser = null; 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 1 - User ID 
          |-------------------------------------------------------------------------- 
          */ 
 
          if (userId) { 
 
            const response = 
              await userService.getUserById( 
                userId 
              ); 
 
 
            const body = 
              response?.data ?? 
              response; 
 
 
            targetUser = 
              body?.user || 
              body?.data?.user || 
              body?.data || 
              body; 
          } 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 2 - Username 
          |-------------------------------------------------------------------------- 
          */ 
 
          if ( 
            !targetUser && 
            username 
          ) { 
 
            const cleanUsername = 
              username 
                .replace("@", "") 
                .trim(); 
 
 
            const response = 
              await userService.getProfile( 
                cleanUsername 
              ); 
 
 
            const body = 
              response?.data ?? 
              response; 
 
 
            targetUser = 
              body?.user || 
              body?.data?.user || 
              body?.data || 
              body; 
          } 
 
 
          if (cancelled) { 
            return; 
          } 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 3 - Target User ID 
          |-------------------------------------------------------------------------- 
          */ 
 
          const targetUserId = 
            targetUser?._id || 
            targetUser?.id; 
 
 
          if (!targetUserId) { 
 
            throw new Error( 
              "Target user ID could not be found." 
            ); 
          } 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 4 - Current User ID 
          |-------------------------------------------------------------------------- 
          */ 
 
          const currentUserId = 
            currentUser?._id || 
            currentUser?.id; 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 5 - Self Protection 
          |-------------------------------------------------------------------------- 
          */ 
 
          if ( 
            currentUserId && 
            String(targetUserId) === 
              String(currentUserId) 
          ) { 
 
            console.error( 
              "Message target is the logged-in user.", 
              { 
                currentUserId, 
                targetUserId, 
                username, 
              } 
            ); 
 
 
            throw new Error( 
              "You cannot create a conversation with yourself." 
            ); 
          } 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 6 - Create / Get Conversation 
          |-------------------------------------------------------------------------- 
          */ 
 
          const conversation = 
            await createConversation( 
              String(targetUserId) 
            ); 
 
 
          if ( 
            !conversation || 
            cancelled 
          ) { 
            return; 
          } 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 7 - Clear Previous Reply 
          |-------------------------------------------------------------------------- 
          */ 
 
          setReplyMessage(null); 
 
          setInputMessage(""); 
 
          setReplySelectVersion(0); 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 8 - Open Conversation 
          |-------------------------------------------------------------------------- 
          */ 
 
          setSelectedConversation( 
            conversation 
          ); 
 
 
          /* 
          |-------------------------------------------------------------------------- 
          | STEP 9 - Clean URL 
          |-------------------------------------------------------------------------- 
          */ 
 
          navigate("/messages", { 
            replace: true, 
          }); 
 
        } catch (err) { 
 
          console.error( 
            "Failed to open user conversation:", 
            err 
          ); 
 
 
          processedTargetRef.current = 
            ""; 
 
        } finally { 
 
          if (!cancelled) { 
            setOpeningUser(false); 
          } 
 
        } 
      }; 
 
 
    openUserConversation(); 
 
 
    return () => { 
      cancelled = true; 
    }; 
 
  }, [ 
    location.search, 
    currentUser, 
    createConversation, 
    navigate, 
  ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | KEEP SELECTED CONVERSATION UPDATED 
  |-------------------------------------------------------------------------- 
  */ 
 
  useEffect(() => { 
 
    if ( 
      !selectedConversation || 
      !conversations?.length 
    ) { 
      return; 
    } 
 
 
    const selectedId = 
      selectedConversation?._id || 
      selectedConversation?.id; 
 
 
    if (!selectedId) { 
      return; 
    } 
 
 
    const latestConversation = 
      conversations.find( 
        (conversation) => { 
 
          const id = 
            conversation?._id || 
            conversation?.id; 
 
          return ( 
            String(id) === 
            String(selectedId) 
          ); 
        } 
      ); 
 
 
    if (!latestConversation) { 
      return; 
    } 
 
 
    const oldUpdatedAt = 
      selectedConversation?.updatedAt 
        ? String( 
            selectedConversation.updatedAt 
          ) 
        : ""; 
 
    const newUpdatedAt = 
      latestConversation?.updatedAt 
        ? String( 
            latestConversation.updatedAt 
          ) 
        : ""; 
 
 
    const oldLastMessage = 
      selectedConversation?.lastMessage 
        ? JSON.stringify( 
            selectedConversation.lastMessage 
          ) 
        : ""; 
 
    const newLastMessage = 
      latestConversation?.lastMessage 
        ? JSON.stringify( 
            latestConversation.lastMessage 
          ) 
        : ""; 
 
 
    if ( 
      oldUpdatedAt === 
        newUpdatedAt && 
      oldLastMessage === 
        newLastMessage 
    ) { 
      return; 
    } 
 
 
    setSelectedConversation( 
      (previous) => { 
 
        if (!previous) { 
          return latestConversation; 
        } 
 
 
        return { 
          ...previous, 
          ...latestConversation, 
        }; 
      } 
    ); 
 
  }, [ 
    conversations, 
    selectedConversation, 
  ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | MARK MESSAGES AS READ 
  |-------------------------------------------------------------------------- 
  | 
  | REST  → persistent/database read state 
  | Socket → realtime WhatsApp-style read receipt 
  | 
  */ 
 
  useEffect(() => { 
 
    if (!conversationId) { 
      return; 
    } 
 
 
    /* 
    |-------------------------------------------------------------------------- 
    | REST - Mark messages as read 
    |-------------------------------------------------------------------------- 
    */ 
 
    markAsRead(); 
 
 
    /* 
    |-------------------------------------------------------------------------- 
    | SOCKET - Notify sender in realtime 
    |-------------------------------------------------------------------------- 
    */ 
 
    markConversationRead( 
      String(conversationId) 
    ); 
 
  }, [ 
    conversationId, 
    markAsRead, 
  ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | REPLY TO MESSAGE 
  |-------------------------------------------------------------------------- 
  | 
  | MessageItem 
  |     ↓ 
  | MessageList 
  |     ↓ 
  | Messages 
  |     ↓ 
  | replyMessage 
  |     ↓ 
  | inputMessage 
  |     ↓ 
  | MessageInput 
  | 
  */ 
 
  const handleReplyMessage = 
    useCallback( 
      (message) => { 
 
        if (!message) { 
          return; 
        } 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Store Original Message 
        |-------------------------------------------------------------------------- 
        */ 
 
        setReplyMessage( 
          message 
        ); 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Get Original Message Text 
        |-------------------------------------------------------------------------- 
        | 
        | Prefer actual text content. 
        | 
        */ 
 
        const replyText = 
          message?.content ?? 
          message?.text ?? 
          ""; 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Put Text Into Input 
        |-------------------------------------------------------------------------- 
        */ 
 
        setInputMessage( 
          String(replyText) 
        ); 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Trigger Input Selection 
        |-------------------------------------------------------------------------- 
        */ 
 
        setReplySelectVersion( 
          (previous) => 
            previous + 1 
        ); 
 
      }, 
      [] 
    ); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | CANCEL REPLY 
  |-------------------------------------------------------------------------- 
  */ 
 
  const handleCancelReply = 
    useCallback(() => { 
 
      setReplyMessage(null); 
 
      setInputMessage(""); 
 
      setReplySelectVersion( 
        (previous) => 
          previous + 1 
      ); 
 
    }, []); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | SEND MESSAGE 
  |-------------------------------------------------------------------------- 
  | 
  | Text: 
  | content + TEXT 
  | 
  | Image/File: 
  | content empty + messageType + mediaUrl 
  | 
  | Reply: 
  | replyMessage ID automatically added. 
  | 
  */ 
 
  const handleSendMessage = 
    useCallback( 
      async ( 
        content, 
        messageType = "TEXT", 
        mediaUrl = null 
      ) => { 
 
        if ( 
          !conversationId || 
          ( 
            !content?.trim() && 
            !mediaUrl 
          ) 
        ) { 
          return null; 
        } 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Reply Message ID 
        |-------------------------------------------------------------------------- 
        */ 
 
        const replyToMessageId = 
          replyMessage?._id || 
          replyMessage?.id || 
          null; 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Send Through useMessages 
        |-------------------------------------------------------------------------- 
        */ 
 
        const result = 
          await sendMessage( 
            content, 
            messageType, 
            mediaUrl, 
            replyToMessageId 
          ); 
 
 
        /* 
        |-------------------------------------------------------------------------- 
        | Clear Reply + Input After Successful Send 
        |-------------------------------------------------------------------------- 
        */ 
 
        if ( 
          result !== false && 
          result !== null && 
          result !== undefined 
        ) { 
 
          setReplyMessage(null); 
 
          setInputMessage(""); 
 
          setReplySelectVersion( 
            (previous) => 
              previous + 1 
          ); 
        } 
 
 
        return result; 
 
      }, [ 
        conversationId, 
        sendMessage, 
        replyMessage, 
      ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | BACK 
  |-------------------------------------------------------------------------- 
  */ 
 
  const handleBack = 
    useCallback(() => { 
 
      setReplyMessage(null); 
 
      setInputMessage(""); 
 
      setReplySelectVersion( 
        (previous) => 
          previous + 1 
      ); 
 
      setSelectedConversation( 
        null 
      ); 
 
 
      navigate("/messages", { 
        replace: true, 
      }); 
 
    }, [ 
      navigate, 
    ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | GET CONVERSATION PARTICIPANT 
  |-------------------------------------------------------------------------- 
  */ 
 
  const getConversationUser = 
    useCallback(() => { 
 
      if (!selectedConversation) { 
        return null; 
      } 
 
 
      const directUser = 
        selectedConversation?.user || 
        selectedConversation?.participant || 
        selectedConversation?.otherUser; 
 
      if (directUser) { 
        return directUser; 
      } 
 
 
      if ( 
        Array.isArray( 
          selectedConversation?.participants 
        ) 
      ) { 
 
        const currentUserId = 
          currentUser?._id || 
          currentUser?.id; 
 
 
        const otherParticipant = 
          selectedConversation.participants.find( 
            (participant) => { 
 
              const participantId = 
                participant?._id || 
                participant?.id || 
                participant?.userId || 
                participant?.user?._id || 
                participant?.user?.id; 
 
 
              return ( 
                participantId && 
                String( 
                  participantId 
                ) !== 
                  String(currentUserId) 
              ); 
 
            } 
          ); 
 
 
        if (otherParticipant) { 
 
          return ( 
            otherParticipant?.user || 
            otherParticipant 
          ); 
 
        } 
      } 
 
 
      return null; 
 
    }, [ 
      selectedConversation, 
      currentUser, 
    ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | GET USER PROFILE IMAGE 
  |-------------------------------------------------------------------------- 
  */ 
 
  const getUserProfileImage = 
    useCallback( 
      (user) => { 
 
        if ( 
          !user || 
          typeof user === "string" || 
          typeof user === "number" 
        ) { 
          return ""; 
        } 
 
 
        return ( 
          user?.profileImage || 
          user?.profilePicture || 
          user?.avatar || 
          user?.avatarUrl || 
          user?.image || 
          user?.photo || 
          user?.picture || 
          user?.profile?.profileImage || 
          user?.profile?.profilePicture || 
          user?.profile?.avatar || 
          "" 
        ); 
      }, 
      [] 
    ); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | USER ONLINE STATUS 
  |-------------------------------------------------------------------------- 
  */ 
 
  const isUserActive = 
    useCallback( 
      (user) => { 
 
        if ( 
          !user || 
          typeof user !== "object" 
        ) { 
          return false; 
        } 
 
 
        return Boolean( 
          user?.isActive ?? 
          user?.isOnline ?? 
          user?.online ?? 
          user?.onlineStatus ?? 
          ( 
            user?.presence === 
            "online" 
          ) 
        ); 
      }, 
      [] 
    ); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | BUILD CALL USER DATA 
  |-------------------------------------------------------------------------- 
  */ 
 
  const buildCallUserData = 
    useCallback( 
      (user) => { 
 
        if (!user) { 
          return null; 
        } 
 
 
        const fullName = 
          user?.fullName || 
          user?.name || 
          user?.username || 
          "User"; 
 
 
        return { 
          ...user, 
 
          _id: 
            user?._id || 
            user?.id, 
 
          id: 
            user?.id || 
            user?._id, 
 
          name: 
            fullName, 
 
          fullName, 
 
          username: 
            user?.username || 
            "", 
 
          profileImage: 
            getUserProfileImage( 
              user 
            ), 
 
          profilePicture: 
            user?.profilePicture || 
            getUserProfileImage( 
              user 
            ), 
 
          isActive: 
            isUserActive(user), 
 
          isOnline: 
            isUserActive(user), 
 
        }; 
 
      }, [ 
        getUserProfileImage, 
        isUserActive, 
      ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | START AUDIO CALL 
  |-------------------------------------------------------------------------- 
  */ 
 
  const handleStartAudioCall = 
    useCallback(() => { 
 
      const user = 
        getConversationUser(); 
 
 
      const targetUserId = 
        user?._id || 
        user?.id; 
 
 
      if (!targetUserId) { 
 
        console.error( 
          "Unable to find the user for this call." 
        ); 
 
        return; 
      } 
 
 
      const currentUserId = 
        currentUser?._id || 
        currentUser?.id; 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | SELF CALL PROTECTION 
      |-------------------------------------------------------------------------- 
      */ 
 
      if ( 
        currentUserId && 
        String(targetUserId) === 
          String(currentUserId) 
      ) { 
 
        console.error( 
          "You cannot call yourself." 
        ); 
 
        return; 
      } 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | GENERATE CALL ID 
      |-------------------------------------------------------------------------- 
      */ 
 
      const callId = 
        generateCallId(); 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | GLOBAL CALL STATE 
      |-------------------------------------------------------------------------- 
      */ 
 
      startCall({ 
        callId, 
 
        callType: 
          "audio", 
 
        targetUser: 
          buildCallUserData( 
            user 
          ), 
 
        participants: [ 
          String(targetUserId), 
        ], 
      }); 
 
    }, [ 
      getConversationUser, 
      currentUser, 
      buildCallUserData, 
      startCall, 
    ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | START VIDEO CALL 
  |-------------------------------------------------------------------------- 
  */ 
 
  const handleStartVideoCall = 
    useCallback(() => { 
 
      const user = 
        getConversationUser(); 
 
 
      const targetUserId = 
        user?._id || 
        user?.id; 
 
 
      if (!targetUserId) { 
 
        console.error( 
          "Unable to find the user for this call." 
        ); 
 
        return; 
      } 
 
 
      const currentUserId = 
        currentUser?._id || 
        currentUser?.id; 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | SELF CALL PROTECTION 
      |-------------------------------------------------------------------------- 
      */ 
 
      if ( 
        currentUserId && 
        String(targetUserId) === 
          String(currentUserId) 
      ) { 
 
        console.error( 
          "You cannot call yourself." 
        ); 
 
        return; 
      } 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | GENERATE CALL ID 
      |-------------------------------------------------------------------------- 
      */ 
 
      const callId = 
        generateCallId(); 
 
 
      /* 
      |-------------------------------------------------------------------------- 
      | GLOBAL CALL STATE 
      |-------------------------------------------------------------------------- 
      */ 
 
      startCall({ 
        callId, 
 
        callType: 
          "video", 
 
        targetUser: 
          buildCallUserData( 
            user 
          ), 
 
        participants: [ 
          String(targetUserId), 
        ], 
      }); 
 
    }, [ 
      getConversationUser, 
      currentUser, 
      buildCallUserData, 
      startCall, 
    ]); 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | OPENING CONVERSATION 
  |-------------------------------------------------------------------------- 
  */ 
 
  if ( 
    openingUser && 
    !selectedConversation 
  ) { 
 
    return ( 
      <div 
        className={`messages-page ${ 
          selectedConversation 
            ? "chat-open" 
            : "" 
        }`} 
      > 
 
        <aside className="messages-sidebar"> 
 
          <ConversationList 
            selectedConversation={ 
              selectedConversation 
            } 
 
            onSelectConversation={ 
              handleSelectConversation 
            } 
          /> 
 
        </aside> 
 
 
        <main className="messages-chat"> 
 
          <div className="flex h-full items-center justify-center"> 
 
            <div className="text-center"> 
 
              <div 
                className=" 
                  mx-auto 
                  h-8 
                  w-8 
                  animate-spin 
                  rounded-full 
                  border-2 
                  border-gray-300 
                  border-t-gray-950 
                " 
              /> 
 
              <p 
                className=" 
                  mt-3 
                  text-sm 
                  text-gray-500 
                " 
              > 
                Opening conversation... 
              </p> 
 
            </div> 
 
          </div> 
 
        </main> 
 
      </div> 
    ); 
  } 
 
 
  /* 
  |-------------------------------------------------------------------------- 
  | MAIN RENDER 
  |-------------------------------------------------------------------------- 
  */ 
 
  return ( 
    <div 
      className={`messages-page ${ 
        selectedConversation 
          ? "chat-open" 
          : "" 
      }`} 
    > 
 
      {/* ================================================================ 
          MESSAGES SIDEBAR 
      ================================================================= */} 
 
      <aside className="messages-sidebar"> 
 
        <ConversationList 
          selectedConversation={ 
            selectedConversation 
          } 
 
          onSelectConversation={ 
            handleSelectConversation 
          } 
 
        /> 
 
      </aside> 
 
 
      {/* ================================================================ 
          CHAT AREA 
      ================================================================= */} 
 
      <main className="messages-chat"> 
 
        {selectedConversation ? ( 
          <> 
 
            <MessageHeader 
              conversation={ 
                selectedConversation 
              } 
 
              onBack={ 
                handleBack 
              } 
 
              onVoiceCall={ 
                handleStartAudioCall 
              } 
 
              onVideoCall={ 
                handleStartVideoCall 
              } 
 
            /> 
 
 
            {/* ========================================================== 
                MESSAGE ERROR 
            =========================================================== */} 
 
            {error && ( 
              <div 
                className=" 
                  px-4 
                  py-2 
                  text-sm 
                  text-red-600 
                " 
              > 
                {error} 
              </div> 
            )} 
 
 
            {/* ========================================================== 
                CALL ERROR 
            =========================================================== */} 
 
            {callError && ( 
              <div 
                className=" 
                  px-4 
                  py-2 
                  text-sm 
                  text-red-600 
                " 
              > 
                {callError} 
              </div> 
            )} 
 
 
            {/* ========================================================== 
                MESSAGE LIST 
            =========================================================== */} 
 
            <MessageList 
              conversation={ 
                selectedConversation 
              } 
 
              messages={ 
                messages 
              } 
 
              loading={ 
                loadingMessages 
              } 
 
              currentUserId={ 
                currentUser?._id || 
                currentUser?.id || 
                null 
              } 
 
              onDeleteMessage={ 
                deleteMessage 
              } 
 
              onUpdateMessage={ 
                updateMessage 
              } 
 
              onReplyMessage={ 
                handleReplyMessage 
              } 
 
            /> 
 
 
            {/* ========================================================== 
                MESSAGE INPUT 
            =========================================================== */} 
 
            <MessageInput 
              conversation={ 
                selectedConversation 
              } 
 
              onSendMessage={ 
                handleSendMessage 
              } 
 
              sending={ 
                sending 
              } 
 
              replyMessage={ 
                replyMessage 
              } 
 
              onCancelReply={ 
                handleCancelReply 
              } 
 
              value={ 
                inputMessage 
              } 
 
              onChange={ 
                setInputMessage 
              } 
 
              selectInput={ 
                replySelectVersion 
              } 
 
            /> 
 
          </> 
        ) : ( 
 
          <EmptyChat /> 
 
        )} 
 
      </main> 
 
    </div> 
  ); 
}; 
 
 
export default Messages;