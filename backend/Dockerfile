FROM elixir:1.14.4

# Install hex and rebar
RUN mix local.hex --force && mix local.rebar --force

# Set your working directory
WORKDIR /app

# Copy your application code to the container
COPY . .

# Install dependencies
RUN mix deps.get

# Compile the application
RUN mix compile