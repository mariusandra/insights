module Insights
  class Authentication
    def self.login_required?
      if defined?(INSIGHTS_LOGIN)
        INSIGHTS_LOGIN.present?
      else
        raise 'You must define INSIGHTS_LOGIN, even if just setting to false to disable authentication'
      end
    end

    def self.successful?(user, password)
      if INSIGHTS_LOGIN.is_a?(Proc)
        proc_login(user, password)
      else
        simple_login(user, password)
      end
    end

  protected

    def self.proc_login(user, password)
      if INSIGHTS_LOGIN.call(user, password)
        true
      else
        false
      end
    end

    def self.simple_login(user, password)
      credentials = INSIGHTS_LOGIN

      if INSIGHTS_LOGIN.flatten.length > 2
        credentials = INSIGHTS_LOGIN.select { |k, v| k == user }.first
      end

      if credentials.present? && user == credentials[0] && password == credentials[1]
        true
      else
        false
      end
    end
  end
end
