# https://gist.github.com/998709
# Symbolizes all of hash's keys and subkeys.
# Also allows for custom pre-processing of keys (e.g. downcasing, etc)
# if the block is given:
#
# somehash.deep_symbolize { |key| key.downcase }
#
# Usage: either include it into global Hash class to make it available to
#        to all hashes, or extend only your own hash objects with this
#        module.
#        E.g.:
#        1) class Hash; include DeepSymbolizable; end
#        2) myhash.extend DeepSymbolizable

module DeepSymbolizable
  def deep_symbolize(&block)
    method = self.class.to_s.downcase.to_sym
    syms = DeepSymbolizable::Symbolizers
    syms.respond_to?(method) ? syms.send(method, self, &block) : self
  end

  module Symbolizers
    extend self

    # the primary method - symbolizes keys of the given hash,
    # preprocessing them with a block if one was given, and recursively
    # going into all nested enumerables
    def hash(hash, &block)
      hash.reduce({}) do |result, (key, value)|
        # Recursively deep-symbolize subhashes
        value = _recurse_(value, &block)

        # Pre-process the key with a block if it was given
        key = yield key if block_given?
        # Symbolize the key string if it responds to to_sym
        sym_key = key.to_sym rescue key

        # write it back into the result and return the updated hash
        result[sym_key] = value
        result
      end
    end

    # walking over arrays and symbolizing all nested elements
    def array(ary, &block)
      ary.map { |v| _recurse_(v, &block) }
    end

    # handling recursion - any Enumerable elements (except String)
    # is being extended with the module, and then symbolized
    def _recurse_(value, &block)
      if value.is_a?(Enumerable) && !value.is_a?(String)
        # support for a use case without extended core Hash
        value.extend DeepSymbolizable unless value.class.include?(DeepSymbolizable)
        value = value.deep_symbolize(&block)
      end
      value
    end
  end
end

class Hash; include DeepSymbolizable; end

#lib/core_ext/hash.rb
class Hash

  def deep_stringify_keys
    dup.deep_stringify_keys!
  end

  def deep_stringify_keys!
    deep_change_keys!(:to_s)
  end

  def deep_change_keys!(change_method = :to_s)
    self.keys.each do |k|
      new_key = k.send(change_method)
      current_value = self.delete(k)
      self[new_key] = current_value.is_a?(Hash) ? current_value.dup.deep_change_keys!(change_method) : current_value
    end
    self
  end

  def sort_by_key(recursive = false, &block)
    self.keys.sort(&block).reduce({}) do |seed, key|
      seed[key] = self[key]
      if recursive && seed[key].is_a?(Hash)
        seed[key] = seed[key].sort_by_key(true, &block)
      end
      seed
    end
  end
end