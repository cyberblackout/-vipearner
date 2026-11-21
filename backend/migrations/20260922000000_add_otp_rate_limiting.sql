-- Add rate limiting columns to otp_cache
ALTER TABLE public.otp_cache
  ADD COLUMN IF NOT EXISTS attempts smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz;

-- Add CHECK constraint for attempts
ALTER TABLE public.otp_cache
  ADD CONSTRAINT otp_cache_attempts_check CHECK (attempts >= 0 AND attempts <= 10);

-- Add index for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_otp_cache_phone ON public.otp_cache(phone);
