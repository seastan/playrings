defmodule DragnCardsWeb.Router do
  use DragnCardsWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    #   plug Pow.Plug.Session, otp_app: :dragncards # If we want HTML Frontend Auth
  end

  pipeline :api do
    plug(:accepts, ["json"])
    plug(DragnCardsWeb.APIAuthPlug, otp_app: :dragncards)
  end

  pipeline :api_protected do
    plug(Pow.Plug.RequireAuthenticated, error_handler: DragnCardsWeb.APIAuthErrorHandler)
  end

  scope "/", DragnCardsWeb do
    pipe_through(:browser)

    get("/json_test", PageController, :json_test)
    get("/", PageController, :index)
  end

  # Other scopes may use custom stacks.
  scope "/api", DragnCardsWeb do
    pipe_through(:api)
    resources("/rooms", RoomController, except: [:new, :edit])
  end

  scope "/api", DragnCardsWeb do
    pipe_through(:api)
    resources("/replays/:user_id", ReplayController, except: [:new, :edit])
  end

  scope "/api/v1", DragnCardsWeb.API.V1, as: :api_v1 do
    pipe_through(:api)

    # Sign up / Sign In
    resources("/registration", RegistrationController, singleton: true, only: [:create])
    resources("/session", SessionController, singleton: true, only: [:create, :delete])
    post("/session/renew", SessionController, :renew)

    # Confirm Email / Forgot Password
    resources("/confirm-email", ConfirmationController, only: [:show])
    post("/reset-password", ResetPasswordController, :create)
    post("/reset-password/update", ResetPasswordController, :update)

    # Profile
    get("/profile", ProfileController, :index)
    post("/profile/update", ProfileController, :update)
    get("/profile/:id", ProfileController, :show)

    # Admin Contact
    get("/admin_contact", AdminContactController, :index)

    # Testing Junk
    get("/authtest", JunkController, :authtest)
    post("/games", GameController, :create)

    # Alerts
    get("/alerts", AlertController, :show)
  end

  scope "/api/v1", DragnCardsWeb.API.V1, as: :api_v1 do
    pipe_through([:api, :api_protected])

    # Your protected API endpoints here
  end
end
