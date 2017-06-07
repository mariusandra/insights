module Insights
  class Structure
    def self.get_structure
      structure = YAML::load_file(INSIGHTS_EXPORT_PATH)

      structure.select { |k, v| v.present? && v['enabled'] }.map do |k, v|
        [k, v.merge({ 'columns' => v['columns'].select { |_, vv| vv.present? } })]
      end.to_h
    end
  end
end
