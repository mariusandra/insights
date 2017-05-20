module Insights
  class Url
    def self.create_short_url(path, user = nil)
      raise "Paths must start with a /" unless path.start_with?('/')

      insights_url = InsightsUrl.create code: SecureRandom.urlsafe_base64,
                                        path: path,
                                        user: user
      "/url/#{insights_url.code}"
    end
  end
end
