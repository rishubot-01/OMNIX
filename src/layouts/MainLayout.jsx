import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import RightSidebar from "../components/layout/RightSidebar";
import MobileNavbar from "../components/layout/MobileNavbar";

import { useApp } from "../context/AppContext";

import { GlobalCallProvider } from "../components/call/GlobalCallManager";

function MainLayout() {
  const {
    sidebarOpen,
    rightSidebarOpen,
  } = useApp();

  const location = useLocation();

  // -------------------------------------------------------------
  // CURRENT PAGE
  // -------------------------------------------------------------

  const isMessagesPage =
    location.pathname === "/messages";

  const isReelsPage =
    location.pathname === "/reels";

  const showRightSidebar =
    rightSidebarOpen &&
    !isMessagesPage &&
    !isReelsPage;

  return (
    <GlobalCallProvider>
      <div className="min-h-screen bg-gray-50 text-gray-950">

        {/* -------------------------------------------------------------
            LEFT SIDEBAR
        ------------------------------------------------------------- */}

        <aside
          className={`
            fixed
            left-0
            top-0
            z-40
            hidden
            h-screen
            border-r
            border-gray-100
            bg-white
            transition-all
            duration-300
            lg:block

            ${
              sidebarOpen
                ? "w-69"
                : "w-20"
            }
          `}
        >
          <Sidebar />
        </aside>

        {/* -------------------------------------------------------------
            MAIN CONTENT
        ------------------------------------------------------------- */}

        <div
          className={`
            min-h-screen
            transition-all
            duration-300

            ${
              sidebarOpen
                ? "lg:pl-62"
                : "lg:pl-19"
            }

            ${
              showRightSidebar
                ? "xl:pr-[400px]"
                : ""
            }
          `}
        >

          {/* -----------------------------------------------------------
              PAGE CONTENT
          ----------------------------------------------------------- */}

          <main
            className={`
              min-h-screen
              w-full
              px-4
              py-1.5
              pb-20
              sm:px-5
              lg:px-6
              lg:pb-6

              ${
                isMessagesPage
                  ? ""
                  : "mx-auto max-w-3xl"
              }

              ${
                isReelsPage
                  ? "lg:-translate-x-12"
                  : ""
              }
            `}
          >
            <MobileNavbar />

            <Outlet />
          </main>

          {/* -----------------------------------------------------------
              RIGHT SIDEBAR
              
              HIDDEN ON:
              - /messages
              - /reels
              
              SHOWN ON ALL OTHER PAGES
          ----------------------------------------------------------- */}

          {showRightSidebar && (
            <aside
              className="
                fixed
                right-0
                top-0
                z-20
                hidden
                h-screen
                w-[380px]
                border-l
                border-gray-100
                bg-white
                xl:block
              "
            >
              <RightSidebar />
            </aside>
          )}

        </div>
      </div>
    </GlobalCallProvider>
  );
}

export default MainLayout;