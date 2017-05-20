module Insights::Export
  class Pdf < Common
    def filename
      "#{export_title}.pdf"
    end

    def type
      'application/pdf'
    end

    def data
      contents = ''
      contents += "<html><head><meta charset='utf-8' /><style>\n"
      contents += "body { font-family: 'Arial' }\n"
      contents += "tr, td, th, tbody, thead, tfoot { page-break-inside: avoid !important; }\n"
      contents += "td { border-bottom: 1px solid #eee; }\n"
      contents += "</style></head><body>\n"

      contents += "<h1>#{export_title}</h1>"

      if response[:graph].present?
        contents += "#{params[:svg]}<br/><br/>\n"
        colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

        contents += "<table style='width:100%'><thead><tr>"
        contents += "<th style='color:white;background:black;'>#{response[:graph][:time_group].capitalize}</th>"

        keys = response[:graph][:keys]
        facets = response[:graph][:facets]

        facet_column_key = facets.present? ? keys.select { |k| k.include?('$$') }.first.split('$$')[0] : nil
        facet_column = facet_column_key.present? ? response[:graph][:meta].select { |r| r[:column] == facet_column_key }.first : nil
        aggregate = facet_column.present? ? facet_column[:aggregate] : nil

        skip = facets.present? ? facet_column_key.length + 2 : longest_common_prefix(keys).length

        keys.each_with_index do |key, index|
          title = key[skip..-1]
          title = title.gsub('.id!!', ' ').gsub('id!!', ' ').gsub('_', ' ').gsub('!!', ' ').gsub('!', ' ')
          title = 'Total' if title == ''
          contents += "<th style='color:white;background:#{colors[index] || 'black'}'>#{CGI::escapeHTML(title)}</th>"
        end

        if facets.present? && aggregate.present? && aggregate != 'avg'
          contents += "<th style='color:white;background:#888;'>#{aggregate.in?(%w(sum count)) ? 'Total' : aggreagete.capitalize}</th>"
        end

        contents += "</tr></thead><tbody>"

        response[:graph][:results].each do |row|
          contents += "<tr>"

          day = row[:time].to_date
          time_group = response[:graph][:time_group]

          if time_group == 'year'
            contents += "<td>#{day.year}</td>"
          elsif time_group == 'quarter'
            contents += "<td>Q#{(day.month / 3.0).ceil} #{day.year}</td>"
          elsif time_group == 'month'
            contents += "<td>#{day.to_s.split('-')[0..1].join('-')}</td>"
          elsif time_group == 'week'
            contents += "<td>#{day.to_s} - #{(day + 6.days).to_s}</td>"
          elsif time_group == 'day'
            contents += "<td>#{day.to_s}</td>"
          end

          total = nil

          column_tds = ''

          max = keys.map { |k| row[k].to_f }.select { |v| !v.nil? }.max

          keys.each do |key|
            value = row[key].nil? ? 0 : row[key].to_f

            # for the "total" column, summing up all the facets per row
            if facets.present? && aggregate.present? && aggregate != 'avg'
              if aggregate == 'count' || aggregate == 'sum'
                total ||= 0
                total += value
              elsif aggregate == 'min'
                total = total.nil? ? value : [value, total].min
              elsif aggregate == 'max'
                total = total.nil? ? value : [value, total].max
              end
            end
            display = format_number(value, aggregate)
            if params[:percentages]
              percentage_value = (max != 0 ? 100.0 * value / max : 0).round
              if percentage_value != 100
                display = "#{display} <span style='color:#888;'>(#{percentage_value}%)</span>"
              end
            end
            column_tds += "<td style='text-align:right'>#{display}</td>"
          end

          contents += column_tds

          if facets.present? && aggregate.present? && aggregate != 'avg'
            contents += "<td style='text-align:right'>#{format_number(total.nil? ? 0 : total.round(2), aggregate)}</td>"
          end

          contents += "</tr>"
        end
        contents += "</tbody></table>"
      else
        contents += "<table style='width:100%'><thead><tr>"
        contents += response[:columns].map do |c|
          path, transform, aggregate = c.split('!', 3)
          header = [aggregate, transform, path.split('.')[1..-1].reverse.join(' < ')].select(&:present?).join(' ')
          "<th style='color:white;background:#888;'>#{CGI::escapeHTML(header)}</th>"
        end.join
        contents += "</tr></thead><tbody>"
        response[:results].each do |row|
          contents += "<tr>" + (row.map { |c| "<td>#{CGI::escapeHTML(c.to_s)}</td>" }.join) + "</tr>"
        end
        contents += "</tbody></table>"
      end

      contents += "</body></html>"

      WickedPdf.new.pdf_from_string(contents, pdf: "#{export_title}.pdf", footer: nil)
    end

  protected

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
