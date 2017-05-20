module Insights::Export
  class Common
    def export_title
      params[:export_title].present? ? params[:export_title] : "Insights Export #{Time.now}"
    end

    def longest_common_prefix(strs)
      return '' if strs.empty?
      min, max = strs.minmax
      idx = min.size.times{ |i| break i if min[i] != max[i] }
      min[0...idx]
    end

    def format_number(number, aggregate = 'count')
      f_amt = aggregate == 'count' ? number.round.to_s : ("%.2f" % number)
      i = f_amt.index(".") || f_amt.length
      while i > 3
        f_amt[i - 3] = " " + f_amt[i-3]
        i = f_amt.index(" ")
      end
      f_amt
    end
  end
end
