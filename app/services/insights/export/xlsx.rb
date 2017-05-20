module Insights::Export
  class Xlsx < Common

    def export_xlsx(response)
      @package = Axlsx::Package.new
      @package.workbook.add_worksheet(name: params[:export_title].present? ? "#{params[:export_title]} Results" : "Results") do |sheet|
        sheet.add_row response[:columns].map { |c| c.split('.')[1..-1].join('.') }
        response[:results].each do |row|
          sheet.add_row row
        end
      end

      if response[:graph].present?
        facet_column_key = facets.present? ? keys.select { |k| k.include?('$$') }.first.split('$$')[0] : nil
        skip = facets.present? ? facet_column_key.length + 2 : longest_common_prefix(keys).length

        @package.workbook.add_worksheet(name: params[:export_title].present? ? "#{params[:export_title]} Graph" : "Graph") do |sheet|
          keys = [:time] + response[:graph][:keys]
          sheet.add_row [:time] + response[:graph][:keys].map { |k| k[skip..-1] }
          response[:graph][:results].each do |row|
            sheet.add_row keys.map { |k| row[k] }
          end
        end
      end

      tempfile = Tempfile.new(['export-', '.xlsx'])
      @package.serialize(tempfile)

      send_file tempfile, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', disposition: 'attachment', filename: "#{export_title}.xlsx"
    end
  end
end
