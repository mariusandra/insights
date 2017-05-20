module Insights::Export
  class Common
    attr_accessor :params, :response

    def initialize(params, response)
      @params = params
      @response = response
    end

    def filename
      raise 'Must override'
    end

    def type
      raise 'Must override'
    end

    def data
      raise 'Must override'
    end

  protected

    def export_title
      params[:export_title].present? ? params[:export_title] : "Insights Export #{Time.now}"
    end

    def longest_common_prefix(strs)
      return '' if strs.empty?
      min, max = strs.minmax
      idx = min.size.times{ |i| break i if min[i] != max[i] }
      min[0...idx]
    end
  end
end
